package com.amde.gestao_clinica.prontuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoricoProntuarioRepository extends JpaRepository<HistoricoProntuario, Long> {

    // Método para buscar todos os prontuários de um paciente, ordenados pelo mais recente
    List<HistoricoProntuario> findByPacienteIdOrderByDataAtualizacaoDesc(Long idUsuario);
}