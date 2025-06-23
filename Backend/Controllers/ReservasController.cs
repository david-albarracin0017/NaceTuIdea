using Backend.Dtos;
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
        public async Task<IActionResult> Create([FromBody] ReservaDTO dto)
        {
            try
            {
                if (dto.FechaFin <= dto.FechaInicio)
                    return BadRequest("La fecha de fin debe ser posterior a la de inicio.");

                if ((dto.FechaFin - dto.FechaInicio).TotalDays < 30)
                    return BadRequest("La reserva mínima debe ser de 1 mes.");

                var reservasExistentes = await _repository.GetByLocalIdAsync(dto.LocalId);
                var hayConflicto = reservasExistentes.Any(r =>
                    r.FechaInicio < dto.FechaFin && r.FechaFin > dto.FechaInicio);

                if (hayConflicto)
                    return Conflict("El local ya tiene una reserva en ese periodo.");

                var nueva = new Reserva
                {
                    Id = Guid.NewGuid(),
                    UsuarioId = dto.UsuarioId,
                    LocalId = dto.LocalId,
                    FechaInicio = dto.FechaInicio,
                    FechaFin = dto.FechaFin
                };

                await _repository.AddAsync(nueva);
                return CreatedAtAction(nameof(GetById), new { id = nueva.Id }, nueva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear la reserva: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ReservaDTO dto)
        {
            try
            {
                var original = await _repository.GetByIdAsync(id);
                if (original == null) return NotFound();

                if (dto.FechaFin <= dto.FechaInicio)
                    return BadRequest("La fecha de fin debe ser posterior a la de inicio.");

                if ((dto.FechaFin - dto.FechaInicio).TotalDays < 30)
                    return BadRequest("La reserva mínima debe ser de 1 mes.");

                var reservasExistentes = await _repository.GetByLocalIdAsync(dto.LocalId);
                var hayConflicto = reservasExistentes.Any(r => r.Id != id &&
                    r.FechaInicio < dto.FechaFin && r.FechaFin > dto.FechaInicio);

                if (hayConflicto)
                    return Conflict("El local ya tiene una reserva en ese periodo.");

                original.FechaInicio = dto.FechaInicio;
                original.FechaFin = dto.FechaFin;

                await _repository.UpdateAsync(original);
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
