import styles from './Profile.module.css';

export function Profile() {
  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h2>Perfil</h2>
        <p>Configure suas informações pessoais</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <div className={styles.avatarPlaceholder}>
              <span>👤</span>
            </div>
            <button className={styles.changeAvatar}>Alterar Foto</button>
          </div>
          
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input type="text" placeholder="Seu nome" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" placeholder="seu@email.com" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Telefone</label>
              <input type="tel" placeholder="(00) 00000-0000" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Categoria Profissional</label>
              <select>
                <option>Desenvolvedor</option>
                <option>Designer</option>
                <option>Consultor</option>
                <option>Outro</option>
              </select>
            </div>
            
            <button className={styles.saveButton}>Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
}