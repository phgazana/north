package br.com.north.controller;

import br.com.north.dto.activity.ActivityResponse;
import br.com.north.security.UserPrincipal;
import br.com.north.service.AtividadeService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trash")
public class TrashController {
    private final AtividadeService service;
    public TrashController(AtividadeService service) { this.service = service; }
    @GetMapping public List<ActivityResponse> list(@AuthenticationPrincipal UserPrincipal user) { return service.trash(user.getId()); }
    @PostMapping("/{id}/restore") public ActivityResponse restore(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) {
        return service.restore(user.getId(), id);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePermanently(@AuthenticationPrincipal UserPrincipal user, @PathVariable UUID id) { service.deletePermanently(user.getId(), id); }
}
