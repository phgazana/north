package br.com.north.service;

import br.com.north.repository.AtividadeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class TrashRetentionService {
    private static final Logger log = LoggerFactory.getLogger(TrashRetentionService.class);
    private final AtividadeRepository activities;
    public TrashRetentionService(AtividadeRepository activities) { this.activities = activities; }
    @Scheduled(cron = "0 20 3 * * *", zone = "UTC")
    public void purgeExpiredEntries() {
        int deleted = activities.deleteExpiredTrash(OffsetDateTime.now(ZoneOffset.UTC).minusDays(30));
        if (deleted > 0) log.info("NORTH: {} atividades expiraram na lixeira e foram removidas permanentemente.", deleted);
    }
}
