package br.com.north.controller;

import br.com.north.dto.auth.UpdateProfileRequest;
import br.com.north.dto.auth.UserResponse;
import br.com.north.security.UserPrincipal;
import br.com.north.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class AccountController {
    private final AccountService service;
    public AccountController(AccountService service) { this.service = service; }
    @GetMapping public UserResponse get(@AuthenticationPrincipal UserPrincipal user) { return service.get(user.getId()); }
    @PatchMapping public UserResponse update(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody UpdateProfileRequest request) {
        return service.update(user.getId(), request);
    }
}
