ALTER TABLE usuarios
    ADD COLUMN landing_screen VARCHAR(16) NOT NULL DEFAULT 'home',
    ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE usuarios
    ADD CONSTRAINT ck_usuarios_landing_screen
        CHECK (landing_screen IN ('home', 'activities'));

ALTER TABLE usuarios
    ALTER COLUMN onboarding_completed SET DEFAULT FALSE;
