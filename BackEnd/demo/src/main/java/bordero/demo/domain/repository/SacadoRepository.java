package bordero.demo.domain.repository;

import bordero.demo.domain.entity.Sacado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SacadoRepository extends JpaRepository<Sacado, Long> {
    Optional<Sacado> findByNomeIgnoreCase(String nome);
    Optional<Sacado> findByCnpj(String cnpj);
}