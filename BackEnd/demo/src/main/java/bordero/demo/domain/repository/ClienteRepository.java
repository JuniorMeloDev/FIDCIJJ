package bordero.demo.domain.repository;

import bordero.demo.domain.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNomeIgnoreCase(String nome);
    Optional<Cliente> findByCnpj(String cnpj);
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}