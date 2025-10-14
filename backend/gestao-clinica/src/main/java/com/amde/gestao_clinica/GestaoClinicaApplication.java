package com.amde.gestao_clinica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class GestaoClinicaApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestaoClinicaApplication.class, args);

				// ...
		BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
		String senhaPlana = "admin1234"; // Use uma senha que você lembre
		String senhaCriptografada = passwordEncoder.encode(senhaPlana);
		System.out.println("NOVA SENHA CRIPTOGRAFADA: " + senhaCriptografada);
		// ...
	}

}
