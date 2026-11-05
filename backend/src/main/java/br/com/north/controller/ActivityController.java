package br.com.north.controller;

import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialType;
import br.com.north.dto.activity.*;
import br.com.north.security.UserPrincipal;
import br.com.north.service.AtividadeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final AtividadeService service;
    public ActivityController(AtividadeService service) { this.service = service; }

    @GetMapping public List<ActivityResponse> list(
        @AuthenticationPrincipal UserPrincipal user,
        @RequestParam(required = false) ActivityStatus status,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) FinancialType type,
        @RequestParam(required = false) Boolean priority,
        @RequestParam(required = false) Boolean favorite,
        @RequestParam(required = false) String search) {
        if (from != null && to != null && from.isAfter(to)) throw br.com.north.exception.ApiException.badRequest("A data inicial não pode ser posterior à data final.");
        return service.list(user.getId(), status, from, to, type, priority, favorite, search);
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponse create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody ActivityRequest request) {
        return service.create(user.getId(), request);
    }
    @GetMapping("/{id}") public ActivityResponse get(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.get(user.getId(), id);
    }
    @PutMapping("/{id}") public ActivityResponse update(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id,
                                                           @Valid @RequestBody ActivityRequest request) {
        return service.update(user.getId(), id, request);
    }
    @PostMapping("/{id}/complete") public ActivityResponse complete(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id,
                                                                       @Valid @RequestBody CompleteActivityRequest request) {
        return service.complete(user.getId(), id, request);
    }
    @PostMapping("/{id}/reopen") public ActivityResponse reopen(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.reopen(user.getId(), id);
    }
    @PostMapping("/{id}/cancel") public ActivityResponse cancel(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.cancel(user.getId(), id);
    }
    @PostMapping("/{id}/duplicate") @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponse duplicate(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.duplicate(user.getId(), id);
    }
    @PatchMapping("/{id}/favorite") public ActivityResponse favorite(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id,
                                                                          @Valid @RequestBody BooleanRequest request) {
        return service.setFavorite(user.getId(), id, request.value());
    }
    @PatchMapping("/{id}/priority") public ActivityResponse priority(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id,
                                                                        @Valid @RequestBody BooleanRequest request) {
        return service.setPriority(user.getId(), id, request.value());
    }
    @PostMapping("/{id}/trash") public ActivityResponse trash(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.moveToTrash(user.getId(), id);
    }
}
