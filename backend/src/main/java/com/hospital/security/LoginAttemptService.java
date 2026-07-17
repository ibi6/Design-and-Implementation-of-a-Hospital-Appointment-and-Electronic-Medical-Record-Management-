package com.hospital.security;

import com.hospital.common.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Applies a bounded in-memory failure window per normalized username. A
 * distributed deployment can replace this service with a Redis-backed store
 * without changing the authentication service contract.
 */
@Service
public class LoginAttemptService {
    private final ConcurrentHashMap<String, FailureWindow> windows = new ConcurrentHashMap<>();
    private final int maxFailures;
    private final int maxTrackedUsernames;
    private final Duration windowDuration;
    private final Clock clock;

    public LoginAttemptService(
            @Value("${app.auth.max-login-failures:5}") int maxFailures,
            @Value("${app.auth.login-failure-window-minutes:15}") long windowMinutes,
            @Value("${app.auth.max-tracked-usernames:10000}") int maxTrackedUsernames) {
        if (maxFailures < 1 || windowMinutes < 1 || maxTrackedUsernames < 1) {
            throw new IllegalArgumentException("登录限流配置必须为正数");
        }
        this.maxFailures = maxFailures;
        this.maxTrackedUsernames = maxTrackedUsernames;
        this.windowDuration = Duration.ofMinutes(windowMinutes);
        this.clock = Clock.systemUTC();
    }

    /** Rejects a login when the active window has reached the failure limit. */
    public void assertAllowed(String username) {
        String key = normalize(username);
        FailureWindow window = windows.get(key);
        if (window == null) return;
        if (isExpired(window)) {
            windows.remove(key, window);
            return;
        }
        if (window.failures() >= maxFailures) {
            throw new BizException(429, "登录失败次数过多，请稍后再试");
        }
    }

    /** Records one failed authentication attempt in the current window. */
    public void recordFailure(String username) {
        String key = normalize(username);
        Instant now = clock.instant();
        windows.compute(key, (ignored, current) -> {
            if (current == null || isExpired(current)) {
                return new FailureWindow(1, now);
            }
            return new FailureWindow(current.failures() + 1, current.startedAt());
        });
        enforceCapacity(key);
    }

    /** Clears the failure window after a successful authentication. */
    public void recordSuccess(String username) {
        windows.remove(normalize(username));
    }

    private boolean isExpired(FailureWindow window) {
        return !clock.instant().isBefore(window.startedAt().plus(windowDuration));
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    /** Evicts expired or oldest entries so random usernames cannot grow memory indefinitely. */
    private void enforceCapacity(String protectedKey) {
        if (windows.size() <= maxTrackedUsernames) return;
        synchronized (windows) {
            windows.entrySet().removeIf(entry -> isExpired(entry.getValue()));
            while (windows.size() > maxTrackedUsernames) {
                String evictionKey = null;
                FailureWindow oldest = null;
                for (var entry : windows.entrySet()) {
                    if (entry.getKey().equals(protectedKey)) continue;
                    if (oldest == null || entry.getValue().startedAt().isBefore(oldest.startedAt())) {
                        evictionKey = entry.getKey();
                        oldest = entry.getValue();
                    }
                }
                if (evictionKey == null || oldest == null) return;
                windows.remove(evictionKey, oldest);
            }
        }
    }

    private record FailureWindow(int failures, Instant startedAt) {}
}
