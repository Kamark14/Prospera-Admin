create database prospera_db;
use prospera_db;

-- tabela de cadastro dos usuarios
create table usuario (
    Usuario_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Nome VARCHAR(100) NOT NULL UNIQUE,
    Usuario_CPF VARCHAR(100) NOT NULL UNIQUE,
    Usuario_Email VARCHAR(100) NOT NULL UNIQUE,
    Usuario_Senha VARCHAR(255) NOT NULL
);

INSERT INTO usuario (Usuario_Nome, Usuario_CPF, Usuario_Email, Usuario_Senha) VALUES
('João Silva', '123.456.789-00', 'joao.silva@email.com', '$2y$10$ABC123def456ghi789jkl'),
('Maria Santos', '987.654.321-00', 'maria.santos@email.com', '$2y$10$DEF456ghi789jkl012mno'),
('Pedro Oliveira', '456.789.123-00', 'pedro.oliveira@email.com', '$2y$10$GHI789jkl012mno345pqr'),
('Ana Costa', '789.123.456-00', 'ana.costa@email.com', '$2y$10$JKL012mno345pqr678stu'),
('Carlos Pereira', '321.654.987-00', 'carlos.pereira@email.com', '$2y$10$MNO345pqr678stu901vwx'),
('Fernanda Lima', '654.987.321-00', 'fernanda.lima@email.com', '$2y$10$PQR678stu901vwx234yza'),
('Ricardo Alves', '147.258.369-00', 'ricardo.alves@email.com', '$2y$10$STU901vwx234yza567bcd'),
('Juliana Martins', '258.369.147-00', 'juliana.martins@email.com', '$2y$10$VWX234yza567bcd890efg'),
('Bruno Rodrigues', '369.147.258-00', 'bruno.rodrigues@email.com', '$2y$10$YZA567bcd890efg123hij'),
('Camila Souza', '741.852.963-00', 'camila.souza@email.com', '$2y$10$BCD890efg123hij456klm'),
('Lucas Ferreira', '852.963.741-00', 'lucas.ferreira@email.com', '$2y$10$EFG123hij456klm789nop'),
('Amanda Rocha', '963.741.852-00', 'amanda.rocha@email.com', '$2y$10$HIJ456klm789nop012qrs'),
('Roberto Nunes', '159.357.486-00', 'roberto.nunes@email.com', '$2y$10$KLM789nop012qrs345tuv'),
('Patrícia Dias', '357.486.159-00', 'patricia.dias@email.com', '$2y$10$NOP012qrs345tuv678wxy'),
('Diego Castro', '486.159.357-00', 'diego.castro@email.com', '$2y$10$QRS345tuv678wxy901zab');

select * from usuario;

-- tabela de perfil dos administradores
create table admin_perfil (
    Admin_Id INT AUTO_INCREMENT PRIMARY KEY,
    Admin_Nome VARCHAR(100) NOT NULL,
    Admin_Email VARCHAR(100) NOT NULL UNIQUE,
    Admin_Senha VARCHAR(255) NOT NULL
);

-- Inserções na tabela de administradores
INSERT INTO admin_perfil (Admin_Nome, Admin_Email, Admin_Senha) VALUES
('Admin Master', 'admin.master@prospera.com', 'AdminMaster'),
('Gerente Financeiro', 'gerente.financeiro@prospera.com', 'Gerente456'),
('Supervisor Contábil', 'supervisor.contabil@prospera.com', 'Supervisor789'),
('Analista Suporte', 'analista.suporte@prospera.com', 'Analista12345');

INSERT INTO admin_perfil (Admin_Nome, Admin_Email, Admin_Senha) VALUES
('Kadmin', 'kaua@gmail.com', 'admin123');

select * from admin_perfil;

-- Tabela de Informações do Usuario
create table usuario_info (
    Usuario_Info_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Id INT NOT NULL,
    Usuario_Endereco VARCHAR(255) NOT NULL,
    Usuario_Cidade VARCHAR(100) NOT NULL,
    Usuario_Estado VARCHAR(100) NOT NULL,
    Usuario_CEP VARCHAR(20) NOT NULL,
    Usuario_Pais VARCHAR(100) NOT NULL,
    Usuario_Telefone VARCHAR(15) NOT NULL,
    Usuario_Profissao VARCHAR(255) NOT NULL,
    Usuario_Emprego_Atual VARCHAR(255) NOT NULL,
    Usuario_Dia_De_Pagamento DATE NOT NULL,
    Usuario_Salario DECIMAL(10,2) NOT NULL,
    Usuario_Data_Nascimento DATE NOT NULL,
    Usuario_Renda_Mensal_Fixa DECIMAL(10,2) NOT NULL,
    Usuario_Renda_Extra DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);

-- Tabela de Gastos Diretos
create table gastos_diretos (
    Gastos_Dir_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Id INT NOT NULL,
    Salario_Usuario DECIMAL(10,2) NOT NULL,
    Conta_De_Agua DECIMAL(10,2) NOT NULL,
    Conta_De_Luz DECIMAL(10,2) NOT NULL,
    Conta_De_Gas DECIMAL(10,2) NOT NULL,
    Conta_Aluguel DECIMAL(10,2) NOT NULL,
    Conta_DadosMoveis DECIMAL(10,2) NOT NULL,
    Conta_Wifi DECIMAL(10,2) NOT NULL,
    Conta_Streaming DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);
    
-- Tabela de Gastos Indiretos
create table gastos_indiretos (
    Gastos_Ind_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Id INT NOT NULL,
    Despesas_Mercado DECIMAL(10,2) NOT NULL,
    Despesas_Feira DECIMAL(10,2) NOT NULL,
    Despesas_Saude DECIMAL(10,2) NOT NULL,
    Despesas_Transporte DECIMAL(10,2) NOT NULL,
    Despesas_Educacao DECIMAL(10,2) NOT NULL,
    Despesas_Lazer DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);

-- Tabela de Tributos
create table tributos (
    Trib_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Id INT NOT NULL,
    IPVA DECIMAL(10,2) NOT NULL,
    IPTU DECIMAL(10,2) NOT NULL,
    ISS DECIMAL(10,2) NOT NULL,
    IRRF_IRRJ DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);

-- Tabelas de Dados de Créditos do Usuario
create table creditos (
    Cred_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Id INT NOT NULL,
    Credito_com_Saude DECIMAL(10,2) NOT NULL,
    Credito_com_VR DECIMAL(10,2) NOT NULL,
    Renda_Principal DECIMAL(10,2) NOT NULL,
    Renda_extra_Continua DECIMAL(10,2) NOT NULL,
    Renda_extra_Variada DECIMAL(10,2) NOT NULL,
    Rendimentos_Tributaveis DECIMAL(10,2) NOT NULL,
    Rendimentos_Nao_Tributaveis DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);

-- Tabelas de Metas Financeiras (VERSÃO CORRIGIDA)
DROP TABLE IF EXISTS meta_financeira_detalhes;
DROP TABLE IF EXISTS meta_financeira;

CREATE TABLE meta_financeira (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nome_Meta VARCHAR(255) NOT NULL,
    Descricao_Meta TEXT,
    Tipo_Meta ENUM('imovel', 'automovel') NOT NULL,
    Prioridade_Meta ENUM('alta', 'media', 'baixa') NOT NULL,
    Status_Meta ENUM('pendente', 'em progresso', 'concluida', 'cancelada') NOT NULL DEFAULT 'pendente',
    Usuario_Id INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id) ON DELETE SET NULL
);

CREATE TABLE meta_financeira_detalhes (
    Meta_Detalhes_Id INT AUTO_INCREMENT PRIMARY KEY,
    Meta_Id INT NOT NULL,
    DataInicio_Meta DATE NOT NULL,
    DataFim_Meta DATE NOT NULL,
    ValorAtual_Meta DECIMAL(12,2) DEFAULT 0,
    ValorAlvo_Meta DECIMAL(12,2) NOT NULL,
    DataCriacao_Meta DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataAtualizacao_Meta DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DataTermino_Meta DATETIME DEFAULT NULL,
    FOREIGN KEY (Meta_Id) REFERENCES meta_financeira(id) ON DELETE CASCADE
);

-- INSERÇÕES CORRIGIDAS E ORGANIZADAS

-- Primeiro: Inserir as metas financeiras
INSERT INTO meta_financeira (Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta, Usuario_Id) VALUES
('Casa Própria', 'Aquisição de apartamento de 2 quartos no centro', 'imovel', 'alta', 'em progresso', 1),
('Carro Novo', 'Compra de carro para trabalho', 'automovel', 'media', 'pendente', 2),
('Terreno', 'Compra de terreno para construção futura', 'imovel', 'baixa', 'pendente', 3),
('Moto', 'Moto para deslocamento urbano', 'automovel', 'media', 'concluida', 4),
('Reforma do Banheiro', 'Reforma completa do banheiro principal', 'imovel', 'media', 'em progresso', 5),
('SUV Familiar', 'Carro maior para família', 'automovel', 'alta', 'pendente', 6),
('Carro Esportivo', 'Carro esportivo para lazer', 'automovel', 'baixa', 'cancelada', 7);

-- Segundo: Inserir os detalhes das metas (usando os IDs gerados automaticamente)
INSERT INTO meta_financeira_detalhes (Meta_Id, DataInicio_Meta, DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta, DataTermino_Meta) VALUES
(1, '2024-01-01', '2026-12-31', 35000.00, 250000.00, NULL),
(2, '2024-03-01', '2025-03-01', 5000.00, 45000.00, NULL),
(3, '2024-02-15', '2027-02-15', 0.00, 80000.00, NULL),
(4, '2023-06-01', '2024-01-31', 15000.00, 15000.00, '2024-01-31 15:30:00'),
(5, '2024-04-01', '2024-12-31', 8000.00, 25000.00, NULL),
(6, '2024-05-01', '2025-05-01', 20000.00, 80000.00, NULL),
(7, '2024-01-01', '2025-01-01', 10000.00, 120000.00, '2024-05-15 10:00:00');

-- Verificar as inserções
SELECT '=== METAS FINANCEIRAS ===' as '';
SELECT * FROM meta_financeira;

SELECT '=== DETALHES DAS METAS ===' as '';
SELECT * FROM meta_financeira_detalhes;

-- Consulta para ver metas com detalhes
SELECT '=== METAS COM DETALHES ===' as '';
SELECT 
    m.id,
    m.Nome_Meta,
    m.Tipo_Meta,
    m.Prioridade_Meta,
    m.Status_Meta,
    u.Usuario_Nome,
    md.DataInicio_Meta,
    md.DataFim_Meta,
    md.ValorAtual_Meta,
    md.ValorAlvo_Meta,
    md.DataTermino_Meta
FROM meta_financeira m
LEFT JOIN meta_financeira_detalhes md ON m.id = md.Meta_Id
LEFT JOIN usuario u ON m.Usuario_Id = u.Usuario_Id
ORDER BY m.id;
