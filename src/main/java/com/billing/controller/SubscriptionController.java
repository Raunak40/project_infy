package com.billing.controller;

import com.billing.dto.SubscriptionDTO;
import com.billing.dto.SubscriptionTransitionRequest;
import com.billing.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription Management", description = "Subscription lifecycle operations")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Get all subscriptions")
    public ResponseEntity<List<SubscriptionDTO>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Search subscriptions")
    public ResponseEntity<Page<SubscriptionDTO>> searchSubscriptions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(subscriptionService.searchSubscriptions(status, customerId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Get subscription by ID")
    public ResponseEntity<SubscriptionDTO> getSubscriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Get subscriptions by customer")
    public ResponseEntity<List<SubscriptionDTO>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(subscriptionService.getByCustomerId(customerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Create subscription")
    public ResponseEntity<SubscriptionDTO> createSubscription(@Valid @RequestBody SubscriptionDTO dto,
                                                               HttpServletRequest request) {
        return new ResponseEntity<>(subscriptionService.createSubscription(dto, request.getRemoteAddr()), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Activate subscription (PENDING → ACTIVE)")
    public ResponseEntity<SubscriptionDTO> activate(@PathVariable Long id, HttpServletRequest request) {
        return ResponseEntity.ok(subscriptionService.activateSubscription(id, request.getRemoteAddr()));
    }

    @PatchMapping("/{id}/suspend")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Suspend subscription (ACTIVE → SUSPENDED)")
    public ResponseEntity<SubscriptionDTO> suspend(@PathVariable Long id,
                                                    @RequestBody SubscriptionTransitionRequest req,
                                                    HttpServletRequest request) {
        return ResponseEntity.ok(subscriptionService.suspendSubscription(id, req, request.getRemoteAddr()));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Reactivate subscription (SUSPENDED → ACTIVE)")
    public ResponseEntity<SubscriptionDTO> reactivate(@PathVariable Long id, HttpServletRequest request) {
        return ResponseEntity.ok(subscriptionService.reactivateSubscription(id, request.getRemoteAddr()));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Cancel subscription (ACTIVE/SUSPENDED → CANCELLED)")
    public ResponseEntity<SubscriptionDTO> cancel(@PathVariable Long id,
                                                   @RequestBody(required = false) SubscriptionTransitionRequest req,
                                                   HttpServletRequest request) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id, req, request.getRemoteAddr()));
    }
}
