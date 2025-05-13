using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DisponibilidadController : ControllerBase
    {
        private readonly IDisponibilidadRepository _repository;

        public DisponibilidadController(IDisponibilidadRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var disponibilidades = await _repository.GetAllAsync();
                return Ok(disponibilidades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var disponibilidad = await _repository.GetByIdAsync(id);
                if (disponibilidad == null) return NotFound();
                return Ok(disponibilidad);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Disponibilidad disponibilidad)
        {
            try
            {
                var nueva = await _repository.AddAsync(disponibilidad);
                return CreatedAtAction(nameof(GetById), new { id = nueva.Id }, nueva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Disponibilidad disponibilidad)
        {
            if (id != disponibilidad.Id) return BadRequest();
            try
            {
                var actualizada = await _repository.UpdateAsync(disponibilidad);
                return Ok(actualizada);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var eliminado = await _repository.DeleteAsync(id);
                if (!eliminado) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar: {ex.Message}");
            }
        }
    }

}
