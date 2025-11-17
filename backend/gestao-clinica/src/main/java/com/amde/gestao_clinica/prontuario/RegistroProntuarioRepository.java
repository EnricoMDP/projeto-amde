package com.amde.gestao_clinica.prontuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroProntuarioRepository extends JpaRepository<RegistroProntuario, Long> {

    // Busca por paciente, IGNORA versões antigas (substituído IS NULL), ordena por categoria e data
    // Note: 'CategoriaIdCategoria' refere-se ao campo 'idCategoria' dentro do objeto 'categoria'
    List<RegistroProntuario> findByPacienteIdAndRegistroSubstituidoIsNullOrderByCategoriaIdCategoriaAscDataRegistroDesc(Long idPaciente);
}