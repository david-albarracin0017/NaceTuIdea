using Backend.Dtos;
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

                // Convertir lista a DTOs
                var responseDtos = mensajes.Select(m => new MensajeResponseDto
                {
                    Id = m.Id,
                    Contenido = m.Contenido,
                    Fecha = m.Fecha,
                    RemitenteId = m.RemitenteId,
                    RemitenteNombre = m.Remitente?.Name ?? "Usuario desconocido",
                    DestinatarioId = m.DestinatarioId,
                    DestinatarioNombre = m.Destinatario?.Name ?? "Usuario desconocido"
                }).ToList();

                return Ok(responseDtos);
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

                // Convertir a DTO para la respuesta
                var responseDto = new MensajeResponseDto
                {
                    Id = mensaje.Id,
                    Contenido = mensaje.Contenido,
                    Fecha = mensaje.Fecha,
                    RemitenteId = mensaje.RemitenteId,
                    RemitenteNombre = mensaje.Remitente?.Name ?? "Usuario desconocido",
                    DestinatarioId = mensaje.DestinatarioId,
                    DestinatarioNombre = mensaje.Destinatario?.Name ?? "Usuario desconocido"
                };

                return Ok(responseDto);
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
                .Select(m =>
                    m.RemitenteId.ToString() == userId
                        ? m.Destinatario
                        : m.Remitente
                )
                .Where(u => u != null) // seguridad extra por si faltan datos
                .Distinct()
                .ToList();

            //  Agregar al propio usuario también si es necesario
            var usuarioActual = mensajes
                .Select(m => m.Remitente)
                .FirstOrDefault(m => m.Id.ToString() == userId);

            if (usuarioActual != null && !relacionados.Any(u => u.Id == usuarioActual.Id))
            {
                relacionados.Add(usuarioActual);
            }

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
                .Select(m => new MensajeResponseDto
                {
                    Id = m.Id,
                    Contenido = m.Contenido,
                    Fecha = m.Fecha,
                    RemitenteId = m.RemitenteId,
                    RemitenteNombre = m.Remitente?.Name ?? "Usuario desconocido",
                    DestinatarioId = m.DestinatarioId,
                    DestinatarioNombre = m.Destinatario?.Name ?? "Usuario desconocido"
                })
                .ToList();

            return Ok(conversacion);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MensajeCreateDto mensajeDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null) return Unauthorized();

                // Validar que no se envíe mensaje a sí mismo
                if (mensajeDto.DestinatarioId.ToString() == userId)
                {
                    return BadRequest("No puedes enviarte mensajes a ti mismo.");
                }

                var mensaje = new Mensaje
                {
                    Contenido = mensajeDto.Contenido,
                    RemitenteId = Guid.Parse(userId),
                    DestinatarioId = mensajeDto.DestinatarioId,
                    Fecha = DateTime.UtcNow
                };

                var nuevo = await _repository.AddAsync(mensaje);

                // Convertir a DTO para la respuesta
                var responseDto = new MensajeResponseDto
                {
                    Id = nuevo.Id,
                    Contenido = nuevo.Contenido,
                    Fecha = nuevo.Fecha,
                    RemitenteId = nuevo.RemitenteId,
                    RemitenteNombre = nuevo.Remitente?.Name ?? "Usuario desconocido",
                    DestinatarioId = nuevo.DestinatarioId,
                    DestinatarioNombre = nuevo.Destinatario?.Name ?? "Usuario desconocido"
                };

                return CreatedAtAction(nameof(GetById), new { id = responseDto.Id }, responseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el mensaje: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MensajeUpdateDto mensajeDto)
        {
            if (id != mensajeDto.Id)
                return BadRequest("El ID proporcionado no coincide con el mensaje.");

            try
            {
                // Obtener el mensaje existente
                var mensajeExistente = await _repository.GetByIdAsync(id);
                if (mensajeExistente == null) return NotFound();

                // Actualizar solo los campos permitidos
                mensajeExistente.Contenido = mensajeDto.Contenido;

                var actualizado = await _repository.UpdateAsync(mensajeExistente);

                // Convertir a DTO para la respuesta
                var responseDto = new MensajeResponseDto
                {
                    Id = actualizado.Id,
                    Contenido = actualizado.Contenido,
                    Fecha = actualizado.Fecha,
                    RemitenteId = actualizado.RemitenteId,
                    RemitenteNombre = actualizado.Remitente?.Name ?? "Usuario desconocido",
                    DestinatarioId = actualizado.DestinatarioId,
                    DestinatarioNombre = actualizado.Destinatario?.Name ?? "Usuario desconocido"
                };

                return Ok(responseDto);
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

        [HttpDelete("eliminar-conversacion/{otroId}")]
        public async Task<IActionResult> EliminarConversacionConUsuario(Guid otroId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mensajes = await _repository.GetAllAsync();

            var aEliminar = mensajes
                .Where(m =>
                    (m.RemitenteId.ToString() == userId && m.DestinatarioId == otroId) ||
                    (m.DestinatarioId.ToString() == userId && m.RemitenteId == otroId))
                .ToList();

            foreach (var mensaje in aEliminar)
            {
                await _repository.DeleteAsync(mensaje.Id);
            }

            return Ok(new { success = true, eliminados = aEliminar.Count });
        }

    }

}
