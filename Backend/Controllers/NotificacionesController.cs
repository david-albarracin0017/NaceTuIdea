using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificacionesController : ControllerBase
    {
        private readonly INotificacionRepository _repository;

        public NotificacionesController(INotificacionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var notificaciones = await _repository.GetAllAsync();
                return Ok(notificaciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener las notificaciones: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var notificacion = await _repository.GetByIdAsync(id);
                if (notificacion == null) return NotFound();
                return Ok(notificacion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener la notificación: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Notificacion notificacion)
        {
            try
            {
                await _repository.AddAsync(notificacion);
                return CreatedAtAction(nameof(GetById), new { id = notificacion.Id }, notificacion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear la notificación: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Notificacion notificacion)
        {
            if (id != notificacion.Id) return BadRequest("El ID no coincide con el recurso enviado.");

            try
            {
                await _repository.UpdateAsync(notificacion);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar la notificación: {ex.Message}");
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
                return StatusCode(500, $"Error al eliminar la notificación: {ex.Message}");
            }
        }
    }

}
