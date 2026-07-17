package com.hospital.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Writes and clears the browser authentication cookie without exposing the JWT
 * to browser storage APIs.
 */
@Service
public class AuthCookieService {
    private final String cookieName;
    private final boolean secure;
    private final int maxAgeSeconds;
    private final String sameSite;

    public AuthCookieService(
            @Value("${app.auth.cookie-name:hospital_session}") String cookieName,
            @Value("${app.auth.cookie-secure:false}") boolean secure,
            @Value("${app.auth.cookie-max-age-seconds:259200}") int maxAgeSeconds,
            @Value("${app.auth.cookie-same-site:Lax}") String sameSite) {
        this.cookieName = cookieName;
        this.secure = secure;
        this.maxAgeSeconds = maxAgeSeconds;
        this.sameSite = sameSite;
    }

    /** Writes a scoped HttpOnly authentication cookie. */
    public void write(HttpServletResponse response, String token) {
        Cookie cookie = baseCookie(token);
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    /** Expires the authentication cookie immediately. */
    public void clear(HttpServletResponse response) {
        Cookie cookie = baseCookie("");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    /** Returns the configured cookie name used by the authentication filter. */
    public String cookieName() {
        return cookieName;
    }

    private Cookie baseCookie(String value) {
        Cookie cookie = new Cookie(cookieName, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setAttribute("SameSite", sameSite);
        return cookie;
    }
}
