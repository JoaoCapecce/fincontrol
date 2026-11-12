
package com.fincontrol.controller;

import com.fincontrol.model.Lancamento;
import com.fincontrol.repository.LancamentoRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lancamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class LancamentoController {

    private final LancamentoRepository repository;

    public LancamentoController(LancamentoRepository repository) {
        this.repository = repository;
    }

    // CADASTRAR LANÇAMENTO
    @PostMapping
    public ResponseEntity<Lancamento> cadastrar(
            @Valid @RequestBody Lancamento lancamento) {

        lancamento.setId(null);
        lancamento.setStatus("PENDENTE");

        Lancamento salvo = repository.save(lancamento);

        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // LISTAR LANÇAMENTOS
    @GetMapping
    public List<Lancamento> listar() {
        return repository.findAll();
    }

    // EDITAR LANÇAMENTO - SOMENTE PENDENTES
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(
            @PathVariable Long id,
            @Valid @RequestBody Lancamento dados) {

        var resultado = repository.findById(id);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "erro", "Lançamento não encontrado."
                    ));
        }

        Lancamento lancamento = resultado.get();

        if (!"PENDENTE".equalsIgnoreCase(lancamento.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "erro",
                            "Somente lançamentos pendentes podem ser editados."
                    ));
        }

        lancamento.setDescricao(dados.getDescricao());
        lancamento.setValor(dados.getValor());
        lancamento.setDataLancamento(dados.getDataLancamento());
        lancamento.setTipo(dados.getTipo());
        lancamento.setCategoria(dados.getCategoria());

        Lancamento atualizado = repository.save(lancamento);

        return ResponseEntity.ok(atualizado);
    }

    // EXCLUIR LANÇAMENTO - SOMENTE PENDENTES
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {

        var resultado = repository.findById(id);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "erro", "Lançamento não encontrado."
                    ));
        }

        Lancamento lancamento = resultado.get();

        if (!"PENDENTE".equalsIgnoreCase(lancamento.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "erro",
                            "Somente lançamentos pendentes podem ser excluídos."
                    ));
        }

        repository.delete(lancamento);

        return ResponseEntity.noContent().build();
    }

    // APROVAR LANÇAMENTO
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<?> aprovar(@PathVariable Long id) {
        return alterarStatus(id, "APROVADO");
    }

    // REJEITAR LANÇAMENTO
    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<?> rejeitar(@PathVariable Long id) {
        return alterarStatus(id, "REJEITADO");
    }

    // VALIDAR E ATUALIZAR O STATUS
    private ResponseEntity<?> alterarStatus(
            Long id, String novoStatus) {

        var resultado = repository.findById(id);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "erro", "Lançamento não encontrado."
                    ));
        }

        Lancamento lancamento = resultado.get();

        if (!"PENDENTE".equalsIgnoreCase(lancamento.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "erro",
                            "Somente lançamentos pendentes podem "
                            + "ser aprovados ou rejeitados."
                    ));
        }

        lancamento.setStatus(novoStatus);

        Lancamento atualizado = repository.save(lancamento);

        return ResponseEntity.ok(atualizado);
    }
}
