import styles from './Clients.module.css';

export function Clients() {
  return (
    <div className={styles.clients}>
      <div className={styles.header}>
        <h2>Clientes</h2>
        <p>Gerencie seus clientes e projetos</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>👥</div>
          <h3>Gerenciamento de Clientes</h3>
          <p>Aqui você poderá cadastrar, editar e visualizar todos os seus clientes.</p>
          <button className={styles.addButton}>
            + Adicionar Novo Cliente
          </button>
        </div>
      </div>
    </div>
  );
}