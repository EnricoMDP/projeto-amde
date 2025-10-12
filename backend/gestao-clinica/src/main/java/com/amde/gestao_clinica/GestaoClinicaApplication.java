package com.amde.gestao_clinica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class GestaoClinicaApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestaoClinicaApplication.class, args);
	}

}
