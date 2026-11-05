package br.com.north;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NorthApplication {
    public static void main(String[] args) {
        SpringApplication.run(NorthApplication.class, args);
    }
}
