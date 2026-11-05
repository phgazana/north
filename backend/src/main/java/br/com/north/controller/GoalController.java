package br.com.north.controller;

import br.com.north.dto.goal.GoalRequest;
import br.com.north.dto.goal.GoalResponse;
import br.com.north.security.UserPrincipal;
import br.com.north.service.MetaMensalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final MetaMensalService service;
    public GoalController(MetaMensalService service) { this.service = service; }
    @GetMapping public List<GoalResponse> list(@AuthenticationPrincipal UserPrincipal user, @RequestParam int year) {
        return service.listByYear(user.getId(), year);
    }
    @GetMapping("/{year}/{month}") public ResponseEntity<GoalResponse> get(@AuthenticationPrincipal UserPrincipal user, @PathVariable int year, @PathVariable int month) {
        GoalResponse goal = service.get(user.getId(), year, month);
        return goal == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(goal);
    }
    @PutMapping @ResponseStatus(HttpStatus.OK)
    public GoalResponse upsert(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody GoalRequest request) {
        return service.upsert(user.getId(), request);
    }
}
