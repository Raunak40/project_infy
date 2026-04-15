package com.billing.controller;

import com.billing.dto.PlanDTO;
import com.billing.service.PlanService;
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
@RequestMapping("/plans")
@RequiredArgsConstructor
@Tag(name = "Plan Management", description = "CRUD operations for subscription plans")
public class PlanController {

    private final PlanService planService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Get all plans")
    public ResponseEntity<List<PlanDTO>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Search and filter plans")
    public ResponseEntity<Page<PlanDTO>> searchPlans(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(planService.searchPlans(name, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER', 'VIEWER')")
    @Operation(summary = "Get plan by ID")
    public ResponseEntity<PlanDTO> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Create a new plan")
    public ResponseEntity<PlanDTO> createPlan(@Valid @RequestBody PlanDTO dto,
                                               HttpServletRequest request) {
        return new ResponseEntity<>(planService.createPlan(dto, request.getRemoteAddr()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Update an existing plan")
    public ResponseEntity<PlanDTO> updatePlan(@PathVariable Long id,
                                               @Valid @RequestBody PlanDTO dto,
                                               HttpServletRequest request) {
        return ResponseEntity.ok(planService.updatePlan(id, dto, request.getRemoteAddr()));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_MANAGER')")
    @Operation(summary = "Activate or deactivate a plan")
    public ResponseEntity<PlanDTO> togglePlanStatus(@PathVariable Long id,
                                                     HttpServletRequest request) {
        return ResponseEntity.ok(planService.togglePlanStatus(id, request.getRemoteAddr()));
    }
}
