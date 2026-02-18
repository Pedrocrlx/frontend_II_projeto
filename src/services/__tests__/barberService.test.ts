import { BarberService, BarberShopData } from '../barberService';
import api from '../api';

// Usamos jest.spyOn para interceptar chamadas ao método 'get' do objeto 'api'
const getSpy = jest.spyOn(api, 'get');

describe('BarberService', () => {
  // Limpa o mock após cada teste para garantir que os testes sejam independentes
  afterEach(() => {
    getSpy.mockClear();
  });

  it('should fetch barber profile by slug', async () => {
    // Definimos um mock mais completo para evitar erros de tipo
    const mockData: Partial<BarberShopData> = { name: 'Test Shop', slug: 'test-shop' };

    // Configuramos o spy para resolver com um objeto que simula a resposta do axios
    getSpy.mockResolvedValue({ data: mockData });

    const result = await BarberService.getProfileBySlug('test-shop');

    // Verificamos se o resultado tem o nome esperado
    expect(result?.name).toBe('Test Shop');
    // Verificamos se a função 'get' foi chamada com o URL correto
    expect(getSpy).toHaveBeenCalledWith('/barber/test-shop');
  });

  it('should return null if an error occurs', async () => {
    // Forçamos o spy a rejeitar a promessa, simulando um erro de rede
    getSpy.mockRejectedValue(new Error('Network Error'));

    const result = await BarberService.getProfileBySlug('test-shop');

    // Verificamos se o serviço retorna null em caso de erro
    expect(result).toBeNull();
    expect(getSpy).toHaveBeenCalledWith('/barber/test-shop');
  });
});
