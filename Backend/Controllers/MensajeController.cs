using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MensajeController : ControllerBase
    {
        private readonly IMensajeRepository _repository;

        public MensajeController(IMensajeRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var mensajes = await _repository.GetAllAsync();
                return Ok(mensajes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener los mensajes: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var mensaje = await _repository.GetByIdAsync(id);
                if (mensaje == null) return NotFound();
                return Ok(mensaje);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el mensaje: {ex.Message}");
            }
        }

        [HttpGet("usuarios-conversacion")]
        public async Task<IActionResult> GetUsuariosConversacion()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mensajes = await _repository.GetAllAsync();

            var relacionados = mensajes
                .Where(m => m.RemitenteId.ToString() == userId || m.DestinatarioId.ToString() == userId)
                .Select(m => m.RemitenteId.ToString() == userId ? m.Destinatario : m.Remitente)
                .Distinct()
                .ToList();

            return Ok(relacionados);
        }

        [HttpGet("conversacion/{otroId}")]
        public async Task<IActionResult> GetConversacionConUsuario(Guid otroId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mensajes = await _repository.GetAllAsync();

            var conversacion = mensajes
                .Where(m =>
                    (m.RemitenteId.ToString() == userId && m.DestinatarioId == otroId) ||
                    (m.RemitenteId == otroId && m.DestinatarioId.ToString() == userId))
                .OrderBy(m => m.Fecha)
                .ToList();

            return Ok(conversacion);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Mensaje mensaje)
        {
            try
            {
                var nuevo = await _repository.AddAsync(mensaje);
                return CreatedAtAction(nameof(GetById), new { id = nuevo.Id }, nuevo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el mensaje: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Mensaje mensaje)
        {
            if (id != mensaje.Id)
                return BadRequest("El ID proporcionado no coincide con el mensaje.");

            try
            {
                var actualizado = await _repository.UpdateAsync(mensaje);
                return Ok(actualizado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar el mensaje: {ex.Message}");
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
                return StatusCode(500, $"Error al eliminar el mensaje: {ex.Message}");
            }
        }
    }

}
