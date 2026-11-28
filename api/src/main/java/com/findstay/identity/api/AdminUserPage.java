package com.findstay.identity.api;

import java.util.List;

public record AdminUserPage(
        List<AdminUserView> items,
        long total,
        int limit,
        int offset
) {
}
