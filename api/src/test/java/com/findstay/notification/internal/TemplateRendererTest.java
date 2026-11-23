package com.findstay.notification.internal;

import com.findstay.shared.Req;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class TemplateRendererTest {

    private final TemplateRenderer renderer = new TemplateRenderer();

    @Test
    @Req("FR-68")
    @DisplayName("Renders standard placeholders correctly")
    void rendersStandardPlaceholders() {
        String template = "Hello {{userName}}, your status is {{status}}.";
        Map<String, Object> values = Map.of("userName", "Bright", "status", "APPROVED");

        String result = renderer.render(template, values);

        assertThat(result).isEqualTo("Hello Bright, your status is APPROVED.");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Safely handles missing placeholders by replacing with empty string")
    void handlesMissingPlaceholdersGracefully() {
        String template = "Hello {{userName}}, review notes: {{notes}}.";
        Map<String, Object> values = Map.of("userName", "Kwesi");

        String result = renderer.render(template, values);

        assertThat(result).isEqualTo("Hello Kwesi, review notes: .");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Safely handles null values in the data map")
    void handlesNullValuesInDataMap() {
        String template = "Owner: {{ownerName}}, Notes: {{notes}}";
        Map<String, Object> values = new HashMap<>();
        values.put("ownerName", "Joseph");
        values.put("notes", null);

        String result = renderer.render(template, values);

        assertThat(result).isEqualTo("Owner: Joseph, Notes: ");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Safely handles null or empty template and empty data map")
    void handlesNullAndEmptyTemplates() {
        assertThat(renderer.render(null, Map.of("key", "val"))).isNull();
        assertThat(renderer.render("Simple string", null)).isEqualTo("Simple string");
        assertThat(renderer.render("Hello {{name}}", Collections.emptyMap())).isEqualTo("Hello ");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Handles regex special characters ($ and \\) in replacement values without error")
    void handlesRegexSpecialCharactersInValues() {
        String template = "Total payout: {{amount}} at {{path}}";
        Map<String, Object> values = Map.of("amount", "$100.00", "path", "C:\\findstay\\files");

        String result = renderer.render(template, values);

        assertThat(result).isEqualTo("Total payout: $100.00 at C:\\findstay\\files");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Handles whitespace inside placeholder brackets like {{ placeholder }}")
    void handlesWhitespaceInsidePlaceholderBrackets() {
        String template = "Alert: {{  propertyName  }} is {{  status  }}";
        Map<String, Object> values = Map.of("propertyName", "Sunset Villa", "status", "APPROVED");

        String result = renderer.render(template, values);

        assertThat(result).isEqualTo("Alert: Sunset Villa is APPROVED");
    }

    @Test
    @Req("FR-71")
    @DisplayName("Renders ORG_STAFF_INVITED email template")
    void rendersStaffInvitationTemplate() {
        NotificationTemplate template = new NotificationTemplate(
                "ORG_STAFF_INVITED",
                "EMAIL",
                "You are invited to join {{companyName}} on FindStay",
                "Hello, you have been invited to join {{companyName}} on FindStay. Click here: {{invitationLink}}"
        );

        Map<String, Object> values = Map.of(
                "companyName", "Accra Luxury Stays",
                "invitationLink", "https://findstay.com/invites/token-xyz"
        );

        RenderedMessage message = renderer.render(template, values);

        assertThat(message.subject()).isEqualTo("You are invited to join Accra Luxury Stays on FindStay");
        assertThat(message.body()).contains("Accra Luxury Stays")
                .contains("https://findstay.com/invites/token-xyz");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Renders VERIFICATION_APPROVED email and SMS templates")
    void rendersVerificationApprovedTemplates() {
        NotificationTemplate emailTemplate = new NotificationTemplate(
                "VERIFICATION_APPROVED",
                "EMAIL",
                "FindStay - Your Owner Verification Has Been Approved!",
                "Hello {{ownerName}}, your owner verification on FindStay has been approved. {{notes}}"
        );

        Map<String, Object> values = Map.of(
                "ownerName", "Kofi Mensah",
                "notes", "Ghana Card and GTA license verified."
        );

        RenderedMessage emailMessage = renderer.render(emailTemplate, values);

        assertThat(emailMessage.subject()).isEqualTo("FindStay - Your Owner Verification Has Been Approved!");
        assertThat(emailMessage.body()).contains("Hello Kofi Mensah")
                .contains("Ghana Card and GTA license verified.");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Renders LISTING_CORRECTIONS_REQUESTED email template with reason and notes")
    void rendersListingCorrectionsRequestedTemplate() {
        NotificationTemplate template = new NotificationTemplate(
                "LISTING_CORRECTIONS_REQUESTED",
                "EMAIL",
                "FindStay - Changes Requested for '{{propertyName}}'",
                "Hello {{ownerName}}, changes requested for '{{propertyName}}'. Reason: {{reason}}. Notes: {{notes}}. Edit: {{editListingUrl}}"
        );

        Map<String, Object> values = Map.of(
                "ownerName", "Ama Serwaa",
                "propertyName", "Airport Residential Suites",
                "reason", "Missing bathroom photo",
                "notes", "Please add at least 1 photo of each ensuite bathroom.",
                "editListingUrl", "https://findstay.com/owner/listings/123/edit"
        );

        RenderedMessage message = renderer.render(template, values);

        assertThat(message.subject()).isEqualTo("FindStay - Changes Requested for 'Airport Residential Suites'");
        assertThat(message.body()).contains("Missing bathroom photo")
                .contains("Please add at least 1 photo of each ensuite bathroom.")
                .contains("https://findstay.com/owner/listings/123/edit");
    }

    @Test
    @Req("FR-71")
    @DisplayName("Renders USER_SUSPENDED and USER_RESTORED templates")
    void rendersAccountStatusTemplates() {
        NotificationTemplate suspended = new NotificationTemplate(
                "USER_SUSPENDED",
                "IN_APP",
                "Account Suspended",
                "Your account has been suspended. Reason: {{reason}}."
        );
        RenderedMessage suspendedMsg = renderer.render(suspended, Map.of("reason", "Suspected policy breach"));
        assertThat(suspendedMsg.body()).isEqualTo("Your account has been suspended. Reason: Suspected policy breach.");

        NotificationTemplate restored = new NotificationTemplate(
                "USER_RESTORED",
                "EMAIL",
                "FindStay - Your Account Has Been Restored",
                "Hello {{userName}}, your account has been reinstated. Login: {{loginUrl}}"
        );
        RenderedMessage restoredMsg = renderer.render(restored, Map.of("userName", "Bright", "loginUrl", "https://findstay.com/login"));
        assertThat(restoredMsg.body()).contains("Hello Bright").contains("https://findstay.com/login");
    }
}
