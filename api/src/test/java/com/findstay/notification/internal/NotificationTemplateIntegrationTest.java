package com.findstay.notification.internal;

import com.findstay.shared.Req;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationTemplateIntegrationTest {

    @Mock
    private NotificationTemplateRepository templateRepository;

    private final TemplateRenderer renderer = new TemplateRenderer();

    @Test
    @Req("FR-68")
    @DisplayName("Finds and renders verification templates")
    void rendersVerificationTemplates() {
        NotificationTemplate approvedTemplate = new NotificationTemplate(
                "VERIFICATION_APPROVED",
                "EMAIL",
                "FindStay - Your Owner Verification Has Been Approved!",
                "Hello {{ownerName}}, your owner verification on FindStay has been reviewed and approved. {{notes}}"
        );

        when(templateRepository.findByEventTypeAndChannelAndActiveTrue("VERIFICATION_APPROVED", "EMAIL"))
                .thenReturn(Optional.of(approvedTemplate));

        Optional<NotificationTemplate> found = templateRepository
                .findByEventTypeAndChannelAndActiveTrue("VERIFICATION_APPROVED", "EMAIL");

        assertThat(found).isPresent();
        RenderedMessage rendered = renderer.render(found.get(), Map.of(
                "ownerName", "Joseph Osei-Bonsu",
                "notes", "Ghana Card and GTA license verified."
        ));

        assertThat(rendered.subject()).isEqualTo("FindStay - Your Owner Verification Has Been Approved!");
        assertThat(rendered.body()).contains("Joseph Osei-Bonsu").contains("Ghana Card and GTA license verified.");
    }

    @Test
    @Req("FR-68")
    @DisplayName("Finds and renders listing lifecycle templates")
    void rendersListingLifecycleTemplates() {
        NotificationTemplate listingApproved = new NotificationTemplate(
                "LISTING_APPROVED",
                "IN_APP",
                "Listing Approved & Live",
                "Great news! Your listing '{{propertyName}}' has been approved and is now live on FindStay."
        );

        when(templateRepository.findByEventTypeAndChannelAndActiveTrue("LISTING_APPROVED", "IN_APP"))
                .thenReturn(Optional.of(listingApproved));

        Optional<NotificationTemplate> found = templateRepository
                .findByEventTypeAndChannelAndActiveTrue("LISTING_APPROVED", "IN_APP");

        assertThat(found).isPresent();
        RenderedMessage rendered = renderer.render(found.get(), Map.of("propertyName", "Labadi Beach Villa"));

        assertThat(rendered.subject()).isEqualTo("Listing Approved & Live");
        assertThat(rendered.body()).isEqualTo("Great news! Your listing 'Labadi Beach Villa' has been approved and is now live on FindStay.");
    }

    @Test
    @Req("FR-71")
    @DisplayName("Finds and renders staff invitation templates")
    void rendersStaffInvitationTemplates() {
        NotificationTemplate staffInvite = new NotificationTemplate(
                "ORG_STAFF_INVITED",
                "EMAIL",
                "You are invited to join {{companyName}} on FindStay",
                "Hello, you have been invited to join {{companyName}} on FindStay. Click here to accept your invitation: {{invitationLink}}"
        );

        when(templateRepository.findByEventTypeAndChannelAndActiveTrue("ORG_STAFF_INVITED", "EMAIL"))
                .thenReturn(Optional.of(staffInvite));

        Optional<NotificationTemplate> found = templateRepository
                .findByEventTypeAndChannelAndActiveTrue("ORG_STAFF_INVITED", "EMAIL");

        assertThat(found).isPresent();
        RenderedMessage rendered = renderer.render(found.get(), Map.of(
                "companyName", "Apex Hospitality",
                "invitationLink", "https://findstay.com/invite/tok123"
        ));

        assertThat(rendered.subject()).isEqualTo("You are invited to join Apex Hospitality on FindStay");
        assertThat(rendered.body()).contains("Apex Hospitality").contains("https://findstay.com/invite/tok123");
    }

    @Test
    @Req("P-08")
    @DisplayName("Finds and renders SMS template for verification with concise length")
    void rendersSmsTemplateConcisely() {
        NotificationTemplate smsTemplate = new NotificationTemplate(
                "VERIFICATION_APPROVED",
                "SMS",
                null,
                "FindStay: Your owner verification has been approved! You can now publish listings in your owner portal."
        );

        when(templateRepository.findByEventTypeAndChannelAndActiveTrue("VERIFICATION_APPROVED", "SMS"))
                .thenReturn(Optional.of(smsTemplate));

        Optional<NotificationTemplate> found = templateRepository
                .findByEventTypeAndChannelAndActiveTrue("VERIFICATION_APPROVED", "SMS");

        assertThat(found).isPresent();
        RenderedMessage rendered = renderer.render(found.get(), Map.of());

        assertThat(rendered.subject()).isNull();
        assertThat(rendered.body()).isNotBlank();
        assertThat(rendered.body().length()).isLessThanOrEqualTo(160); // SMS 160 char limit
    }
}
