package br.com.north.controller;

import br.com.north.dto.summary.MonthlySummaryResponse;
import br.com.north.security.UserPrincipal;
import br.com.north.service.ResumoMensalService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/monthly-summary")
public class MonthlySummaryController {
    private final ResumoMensalService service;
    public MonthlySummaryController(ResumoMensalService service) { this.service = service; }
    @GetMapping("/history") public List<MonthlySummaryResponse> history(@AuthenticationPrincipal UserPrincipal user, @RequestParam int year) {
        return service.history(user.getId(), year);
    }
    @GetMapping public MonthlySummaryResponse get(@AuthenticationPrincipal UserPrincipal user, @RequestParam int year, @RequestParam int month) {
        return service.get(user.getId(), year, month);
    }
}
