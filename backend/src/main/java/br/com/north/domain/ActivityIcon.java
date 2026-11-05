package br.com.north.domain;

import java.util.Set;

public final class ActivityIcon {
    public static final Set<String> ALLOWED = Set.of("market", "study", "work", "health", "home", "payment", "leisure", "other");
    private ActivityIcon() {}
    public static boolean isAllowed(String value) { return value != null && ALLOWED.contains(value); }
}
