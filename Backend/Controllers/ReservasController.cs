using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservasController : ControllerBase
    {
        private readonly IReservaRepository _repository;

        public ReservasController(IReservaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var reservas = await _repository.GetAllAsync();
                return Ok(reservas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener las reservas: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var reserva = await _repository.GetByIdAsync(id);
                if (reserva == null) return NotFound();
                return Ok(reserva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener la reserva: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Reserva reserva)
        {
            try
            {
                await _repository.AddAsync(reserva);
                return CreatedAtAction(nameof(GetById), new { id = reserva.Id }, reserva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear la reserva: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Reserva reserva)
        {
            if (id != reserva.Id) return BadRequest("El ID de la reserva no coincide.");

            try
            {
                await _repository.UpdateAsync(reserva);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar la reserva: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _repository.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar la reserva: {ex.Message}");
            }
        }
    }

}
