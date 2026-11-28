package com.findstay.availability.internal;

import com.findstay.availability.api.AvailabilityBlockView;
import com.findstay.availability.internal.AvailabilityDtos.AvailabilityCalendarResponse;
import com.findstay.availability.internal.AvailabilityDtos.CreateBlockRequest;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Owner &amp; authorised staff unit availability calendar endpoints ({@code S1-14-T3}).
 */
@RestController
@RequestMapping("/api/v1/owner/units/{unitId}")
class AvailabilityController {

    private final AvailabilityService availabilityService;

    AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping({"/availability", "/calendar"})
    @RequiresPermission("availability.read")
    AvailabilityCalendarResponse getUnitCalendar(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID unitId,
            @RequestParam(required = false) String month
    ) {
        return availabilityService.getUnitCalendar(OrgScope.requireUserId(jwt), unitId, month);
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("availability.write")
    AvailabilityBlockView createBlock(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID unitId,
            @RequestBody CreateBlockRequest request
    ) {
        return availabilityService.createBlock(OrgScope.requireUserId(jwt), unitId, request);
    }

    @DeleteMapping("/blocks/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission("availability.write")
    void deleteBlock(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID unitId,
            @PathVariable UUID blockId
    ) {
        availabilityService.deleteBlock(OrgScope.requireUserId(jwt), unitId, blockId);
    }
}
