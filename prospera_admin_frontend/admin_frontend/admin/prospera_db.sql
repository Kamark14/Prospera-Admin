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

-- tabela de perfil dos administradores
create table admin_perfil (
    Admin_Id INT AUTO_INCREMENT PRIMARY KEY,
    Admin_Nome VARCHAR(100) NOT NULL,
    Admin_Email VARCHAR(100) NOT NULL UNIQUE,
    Admin_Senha VARCHAR(255) NOT NULL
);

-- Tabela de Informações do Usuario
create table usuario_info (
    Usuario_Info_Id INT AUTO_INCREMENT PRIMARY KEY,
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
    Usuario_Renda_Extra DECIMAL(10,2) NOT NULL
);

-- Tabelas de Dados de Debitos do Usuario

-- Tabela de Gastos Diretos
create table gastos_diretos (
    Gastos_Dir_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Salario_Usuario DECIMAL(10,2) NOT NULL,
    Conta_De_Agua DECIMAL(10,2) NOT NULL,
    Conta_De_Luz DECIMAL(10,2) NOT NULL,
    Conta_De_Gas DECIMAL(10,2) NOT NULL,
    Conta_Aluguel DECIMAL(10,2) NOT NULL,
    Conta_DadosMoveis DECIMAL(10,2) NOT NULL,
    Conta_Wifi DECIMAL(10,2) NOT NULL,
    Conta_Streaming DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuarios(Usuario_Id)
);
    
-- Tabela de Gastos Indiretos
create table gastos_indiretos (
    Gastos_Ind_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Despesas_Mercado DECIMAL(10,2) NOT NULL,
    Despesas_Feira DECIMAL(10,2) NOT NULL,
    Despesas_Saude DECIMAL(10,2) NOT NULL,
    Despesas_Transporte DECIMAL(10,2) NOT NULL,
    Despesas_Educacao DECIMAL(10,2) NOT NULL,
    Despesas_Lazer DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuarios(Usuario_Id)
);

-- Tabela de Tributos
create table tributos (
    Trib_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    IPVA DECIMAL(10,2) NOT NULL,
    IPTU DECIMAL(10,2) NOT NULL,
    ISS DECIMAL(10,2) NOT NULL,
    IRRF_IRRJ DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuarios(Usuario_Id)
);

-- Tabelas de Dados de Créditos do Usuario
create table creditos (
    Cred_User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Credito_com_Saude DECIMAL(10,2) NOT NULL,
    Credito_com_VR DECIMAL(10,2) NOT NULL,
    Renda_Principal DECIMAL(10,2) NOT NULL,
    Renda_extra_Continua DECIMAL(10,2) NOT NULL,
    Renda_extra_Variada DECIMAL(10,2) NOT NULL,
    Rendimentos_Tributaveis DECIMAL(10,2) NOT NULL,
    Rendimentos_Nao_Tributaveis DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuarios(Usuario_Id)
);

-- Tabela de meta financeira
CREATE TABLE meta_financeira (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nome_Meta VARCHAR(100) NOT NULL,
    Descricao_Meta VARCHAR(255) NOT NULL,
    Tipo_Meta ENUM('imovel', 'automovel') NOT NULL,
    Prioridade_Meta ENUM('alta', 'media', 'baixa') NOT NULL,
    Status_Meta ENUM('pendente', 'em progresso', 'concluida', 'cancelada') NOT NULL DEFAULT 'pendente',
    Usuario_Id INT NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES usuario(Usuario_Id)
);

-- Tabela de detalhes da meta financeira
CREATE TABLE meta_financeira_detalhes (
    Meta_Id INT NOT NULL,
    FOREIGN KEY (Meta_Id) REFERENCES meta_financeira(id),
    Meta_Detalhes_Id INT AUTO_INCREMENT PRIMARY KEY,
    DataInicio_Meta DATE NOT NULL,
    DataFim_Meta DATE NOT NULL,
    ValorAtual_Meta DECIMAL(10,2) DEFAULT 0,
    ValorAlvo_Meta DECIMAL(10,2) NOT NULL,
    DataCriacao_Meta DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataAtualizacao_Meta DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DataTermino_Meta DATETIME DEFAULT NULL,
);

-- Inserções na tabela de usuários
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

-- Inserções na tabela de administradores
INSERT INTO admin_perfil (Admin_Nome, Admin_Email, Admin_Senha) VALUES
('Admin Master', 'admin.master@prospera.com', '$2y$10$AdminMasterHash123456789'),
('Gerente Financeiro', 'gerente.financeiro@prospera.com', '$2y$10$GerenteFinanceiroHash456'),
('Supervisor Contábil', 'supervisor.contabil@prospera.com', '$2y$10$SupervisorContabilHash789'),
('Analista Suporte', 'analista.suporte@prospera.com', '$2y$10$AnalistaSuporteHash012345');

-- Inserções na tabela de informações dos usuários
INSERT INTO usuario_info (Usuario_Endereco, Usuario_Cidade, Usuario_Estado, Usuario_CEP, Usuario_Pais, Usuario_Telefone, Usuario_Profissao, Usuario_Emprego_Atual, Usuario_Dia_De_Pagamento, Usuario_Salario, Usuario_Data_Nascimento, Usuario_Renda_Mensal_Fixa, Usuario_Renda_Extra) VALUES
('Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Brasil', '(11) 99999-9999', 'Engenheiro de Software', 'Tech Solutions SA', '2024-01-05', 8500.00, '1985-03-15', 8500.00, 1200.00),
('Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'Brasil', '(11) 98888-8888', 'Analista Financeiro', 'Banco Central', '2024-01-10', 6200.00, '1990-07-22', 6200.00, 800.00),
('Rua Augusta, 500', 'São Paulo', 'SP', '01304-000', 'Brasil', '(11) 97777-7777', 'Designer Gráfico', 'Agência Criativa', '2024-01-15', 4500.00, '1992-11-30', 4500.00, 1500.00),
('Alameda Santos, 200', 'São Paulo', 'SP', '01418-200', 'Brasil', '(11) 96666-6666', 'Médica', 'Hospital São Lucas', '2024-01-20', 12500.00, '1988-05-10', 12500.00, 0.00),
('Rua Oscar Freire, 800', 'São Paulo', 'SP', '01426-000', 'Brasil', '(11) 95555-5555', 'Advogado', 'Escritório Jurídico', '2024-01-25', 7800.00, '1987-09-18', 7800.00, 2000.00),
('Av. Brigadeiro Faria Lima, 1500', 'São Paulo', 'SP', '01451-000', 'Brasil', '(11) 94444-4444', 'Arquiteto', 'Construtora Planalto', '2024-01-05', 6900.00, '1991-12-05', 6900.00, 1000.00),
('Rua Haddock Lobo, 400', 'São Paulo', 'SP', '01414-000', 'Brasil', '(11) 93333-3333', 'Professor Universitário', 'Universidade Estadual', '2024-01-10', 5500.00, '1984-08-12', 5500.00, 1800.00),
('Alameda Jaú, 1001', 'São Paulo', 'SP', '01420-001', 'Brasil', '(11) 92222-2222', 'Enfermeira', 'Clínica Saúde Total', '2024-01-15', 3800.00, '1993-04-25', 3800.00, 600.00),
('Rua Bela Cintra, 600', 'São Paulo', 'SP', '01415-000', 'Brasil', '(11) 91111-1111', 'Consultor de TI', 'Consultoria Tech', '2024-01-20', 7200.00, '1989-01-08', 7200.00, 2500.00),
('Av. Rebouças, 3000', 'São Paulo', 'SP', '05402-000', 'Brasil', '(11) 90000-0000', 'Psicóloga', 'Clínica Bem Estar', '2024-01-25', 4800.00, '1990-06-14', 4800.00, 1200.00);

-- Inserções na tabela de gastos diretos
INSERT INTO gastos_diretos (Salario_Usuario, Conta_De_Agua, Conta_De_Luz, Conta_De_Gas, Conta_Aluguel, Conta_DadosMoveis, Conta_Wifi, Conta_Streaming) VALUES
(8500.00, 120.50, 180.75, 85.00, 2200.00, 89.90, 129.90, 59.90),
(6200.00, 95.30, 150.25, 65.50, 1800.00, 79.90, 99.90, 79.90),
(4500.00, 80.00, 120.00, 45.00, 1200.00, 49.90, 89.90, 39.90),
(12500.00, 150.75, 220.50, 95.00, 3500.00, 99.90, 149.90, 99.90),
(7800.00, 110.25, 165.80, 75.50, 2500.00, 89.90, 119.90, 69.90),
(6900.00, 105.00, 155.60, 70.00, 2100.00, 79.90, 109.90, 59.90),
(5500.00, 90.50, 135.40, 60.00, 1500.00, 69.90, 99.90, 49.90),
(3800.00, 75.25, 110.30, 50.00, 1000.00, 59.90, 79.90, 29.90),
(7200.00, 115.80, 170.90, 80.00, 2300.00, 89.90, 129.90, 79.90),
(4800.00, 85.60, 125.75, 55.00, 1300.00, 69.90, 89.90, 39.90);

-- Inserções na tabela de gastos indiretos
INSERT INTO gastos_indiretos (Despesas_Mercado, Despesas_Feira, Despesas_Saude, Despesas_Transporte, Despesas_Educacao, Despesas_Lazer) VALUES
(1200.00, 300.00, 250.00, 400.00, 500.00, 600.00),
(900.00, 200.00, 180.00, 350.00, 300.00, 400.00),
(700.00, 150.00, 120.00, 250.00, 200.00, 300.00),
(1500.00, 400.00, 500.00, 600.00, 800.00, 1000.00),
(1100.00, 250.00, 300.00, 450.00, 400.00, 550.00),
(1000.00, 220.00, 280.00, 420.00, 350.00, 480.00),
(800.00, 180.00, 200.00, 300.00, 250.00, 350.00),
(600.00, 120.00, 150.00, 200.00, 180.00, 250.00),
(1050.00, 280.00, 320.00, 480.00, 420.00, 520.00),
(750.00, 160.00, 180.00, 280.00, 220.00, 320.00);

-- Inserções na tabela de tributos
INSERT INTO tributos (IPVA, IPTU, ISS, IRRF_IRRJ) VALUES
(1200.00, 2500.00, 0.00, 1800.00),
(0.00, 1800.00, 350.00, 950.00),
(800.00, 1200.00, 0.00, 520.00),
(2500.00, 4200.00, 0.00, 3100.00),
(1500.00, 2800.00, 420.00, 1450.00),
(1300.00, 2200.00, 0.00, 1250.00),
(600.00, 1500.00, 280.00, 680.00),
(0.00, 900.00, 0.00, 320.00),
(1400.00, 2600.00, 380.00, 1350.00),
(0.00, 1100.00, 0.00, 480.00);

-- Inserções na tabela de créditos
INSERT INTO creditos (Credito_com_Saude, Credito_com_VR, Renda_Principal, Renda_extra_Continua, Renda_extra_Variada, Rendimentos_Tributaveis, Rendimentos_Nao_Tributaveis) VALUES
(500.00, 800.00, 8500.00, 800.00, 400.00, 1200.00, 300.00),
(300.00, 550.00, 6200.00, 500.00, 300.00, 800.00, 200.00),
(200.00, 350.00, 4500.00, 1000.00, 500.00, 600.00, 150.00),
(800.00, 1200.00, 12500.00, 0.00, 0.00, 2000.00, 500.00),
(450.00, 650.00, 7800.00, 1500.00, 500.00, 1200.00, 350.00),
(400.00, 600.00, 6900.00, 700.00, 300.00, 900.00, 250.00),
(250.00, 450.00, 5500.00, 1200.00, 600.00, 700.00, 180.00),
(180.00, 300.00, 3800.00, 400.00, 200.00, 450.00, 120.00),
(420.00, 700.00, 7200.00, 1800.00, 700.00, 1100.00, 320.00),
(220.00, 380.00, 4800.00, 800.00, 400.00, 550.00, 160.00);

-- Inserções na tabela de metas financeiras
INSERT INTO meta_financeira (Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta, Usuario_Id) VALUES
('Aquisição de Apartamento', 'Comprar apartamento de 2 quartos na zona sul', 'imovel', 'alta', 'em progresso', 1),
('Troca de Carro', 'Trocar carro atual por modelo mais novo', 'automovel', 'media', 'pendente', 1),
('Viagem Europa', 'Viajar para Europa por 15 dias', 'outros', 'baixa', 'pendente', 2),
('Pós-Graduação', 'Custear especialização em Finanças', 'outros', 'alta', 'em progresso', 2),
('Apartamento Próprio', 'Entrada para financiamento imobiliário', 'imovel', 'alta', 'pendente', 3),
('Carro Zero', 'Compra de primeiro carro zero km', 'automovel', 'media', 'em progresso', 4),
('Reforma da Casa', 'Reformar cozinha e banheiro', 'imovel', 'media', 'concluida', 5),
('Moto Nova', 'Compra de moto para trabalho', 'automovel', 'alta', 'em progresso', 6),
('Investimento Educação', 'Reserva para mestrado no exterior', 'outros', 'alta', 'pendente', 7),
('Casa na Praia', 'Aquisição de casa de praia', 'imovel', 'baixa', 'pendente', 8);

-- Inserções na tabela de detalhes das metas financeiras
INSERT INTO meta_financeira_detalhes (Meta_Id, DataInicio_Meta, DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta) VALUES
(1, '2024-01-01', '2026-12-31', 45000.00, 150000.00),
(2, '2024-03-01', '2025-12-31', 8000.00, 40000.00),
(3, '2024-02-01', '2025-06-30', 2000.00, 15000.00),
(4, '2024-01-15', '2024-12-31', 12000.00, 25000.00),
(5, '2024-02-01', '2027-12-31', 15000.00, 80000.00),
(6, '2024-01-01', '2024-12-31', 25000.00, 60000.00),
(7, '2023-06-01', '2023-12-31', 35000.00, 35000.00),
(8, '2024-02-01', '2024-08-31', 8000.00, 15000.00),
(9, '2024-01-01', '2026-12-31', 10000.00, 80000.00),
(10, '2024-03-01', '2030-12-31', 5000.00, 200000.00);

ALTER TABLE usuario_info ADD COLUMN Usuario_Id INT;
ALTER TABLE gastos_diretos ADD COLUMN Usuario_Id INT;
ALTER TABLE gastos_indiretos ADD COLUMN Usuario_Id INT;
ALTER TABLE tributos ADD COLUMN Usuario_Id INT;
ALTER TABLE creditos ADD COLUMN Usuario_Id INT;