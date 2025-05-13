using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ValoracionesController : ControllerBase
    {
        private readonly IValoracionRepository _repository;

        public ValoracionesController(IValoracionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var valoraciones = await _repository.GetAllAsync();
                return Ok(valoraciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener las valoraciones: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var valoracion = await _repository.GetByIdAsync(id);
                if (valoracion == null) return NotFound();
                return Ok(valoracion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener la valoración: {ex.Message}");
            }
        }

        [HttpGet("local/{localId}")]
        public async Task<IActionResult> GetByLocal(Guid localId)
        {
            try
            {
                var valoraciones = await _repository.GetByLocalIdAsync(localId);
                return Ok(valoraciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener valoraciones por local: {ex.Message}");
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetByUsuario(Guid usuarioId)
        {
            try
            {
                var valoraciones = await _repository.GetByUsuarioIdAsync(usuarioId);
                return Ok(valoraciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener valoraciones por usuario: {ex.Message}");
            }
        }


    }
}
