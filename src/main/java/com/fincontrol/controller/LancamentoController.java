package com.fincontrol.controller;

import com.fincontrol.model.Lancamento;
import com.fincontrol.repository.LancamentoRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lancamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class LancamentoController {

    private final LancamentoRepository repository;

    public LancamentoController(LancamentoRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Lancamento> cadastrar(
            @Valid @RequestBody Lancamento lancamento) {

        lancamento.setStatus("PENDENTE");

        Lancamento salvo = repository.save(lancamento);

        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public List<Lancamento> listar() {
        return repository.findAll();
    }
}