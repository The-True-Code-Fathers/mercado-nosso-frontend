# Sistema de Cálculo de Frete Baseado em Distância Real

## ✅ Implementação Concluída

### Como Funciona:

1. **Consulta do CEP**: Utiliza a Brasil API v2 para obter dados do CEP
2. **Obtenção de Coordenadas**: Extrai latitude/longitude do destino
3. **Cálculo de Distância**: Usa fórmula de Haversine para distância real
4. **Estimativa de Entrega**: Baseada nas velocidades definidas

### Velocidades de Transporte:

- **SEDEX**: 1.000 km/dia (mais rápido)
- **PAC**: 500 km/dia (econômico)

### Metodologia de Cálculo:

1. **Distância Base**: Londrina-PR como origem (-23.3045, -51.1696)
2. **Coordenadas do Destino**: Obtidas via Brasil API ou base de dados
3. **Fórmula Haversine**: Cálculo preciso da distância em linha reta
4. **Fator de Correção**: 1.3x para compensar rotas não lineares
5. **Dias de Entrega**: `Math.ceil(distância_km / velocidade_por_dia)`

### Limites Aplicados:

- **SEDEX**: Mínimo 1 dia, máximo 7 dias
- **PAC**: Mínimo 2 dias, máximo 15 dias

### Fallbacks Implementados:

1. **Coordenadas Diretas**: Quando o CEP retorna lat/lng
2. **Coordenadas da Cidade**: Base de dados das principais cidades
3. **Distância por Estado**: Estimativas baseadas em distâncias médias
4. **Estimativa Conservadora**: Quando todas as APIs falham

### Base de Dados de Cidades:

Coordenadas precisas para 29+ cidades principais do Brasil, incluindo:

- Todas as capitais
- Principais cidades do interior
- Regiões metropolitanas

### Exemplo de Cálculo:

**CEP: 01310-100 (São Paulo-SP)**

- Distância: ~400km de Londrina
- Com fator 1.3: ~520km
- SEDEX: 1 dia (520/1000 = 0.52 → 1 dia)
- PAC: 2 dias (520/500 = 1.04 → 2 dias)

**CEP: 69900-000 (Rio Branco-AC)**

- Distância: ~2.500km de Londrina
- Com fator 1.3: ~3.250km
- SEDEX: 4 dias (3250/1000 = 3.25 → 4 dias)
- PAC: 7 dias (3250/500 = 6.5 → 7 dias)

### APIs Utilizadas:

1. **Brasil API v2**: `https://brasilapi.com.br/api/cep/v2/{cep}`
   - Dados do endereço
   - Coordenadas quando disponíveis

### Tratamento de Erros:

- ✅ CEP inválido: Fallback por estado
- ✅ API indisponível: Estimativa conservadora
- ✅ Coordenadas ausentes: Base de dados própria
- ✅ Distâncias extremas: Limites aplicados

### Informações Exibidas:

- Tipo de entrega (SEDEX/PAC)
- Custo calculado (5% do produto + multiplicador)
- Dias úteis estimados
- Cidade/Estado de destino
- Distância aproximada em km

**Status**: ✅ Sistema totalmente funcional com cálculos baseados em distâncias reais!
