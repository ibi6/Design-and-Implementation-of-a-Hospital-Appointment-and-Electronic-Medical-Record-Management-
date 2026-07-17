package com.hospital.security;

import com.hospital.common.BizException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginAttemptServiceTest {
    @Test
    void boundsTrackedUsernamesAndRetainsPerUserLimit() {
        LoginAttemptService service = new LoginAttemptService(2, 15, 1);

        service.recordFailure("first");
        service.recordFailure("first");
        assertThatThrownBy(() -> service.assertAllowed("first"))
                .isInstanceOf(BizException.class);

        service.recordFailure("second");
        assertThatCode(() -> service.assertAllowed("first")).doesNotThrowAnyException();
        assertThatCode(() -> service.assertAllowed("second")).doesNotThrowAnyException();
    }
}
