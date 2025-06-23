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
    public class ValoracionesController : ControllerBase
    {
        private readonly IValoracionRepository _repository;
        private readonly INotificacionRepository _notificacionRepo;

        public ValoracionesController(
            IValoracionRepository repository,
            INotificacionRepository notificacionRepo)
        {
            _repository = repository;
            _notificacionRepo = notificacionRepo;
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

        [HttpGet("promedio/{localId}")]
        public async Task<IActionResult> GetPromedio(Guid localId)
        {
            try
            {
                var promedio = await _repository.GetPromedioByLocalAsync(localId);
                var count = await _repository.GetCountByLocalAsync(localId);
                return Ok(new { promedio, count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el promedio: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ValoracionDTO valoracionDto)
        {
            try
            {
                // Validación básica
                if (valoracionDto.Estrellas < 1 || valoracionDto.Estrellas > 5)
                {
                    return BadRequest("La valoración debe ser entre 1 y 5 estrellas");
                }

                if (valoracionDto.LocalId == Guid.Empty || valoracionDto.UsuarioId == Guid.Empty)
                {
                    return BadRequest("Se requieren LocalId y UsuarioId válidos");
                }

                // Verificar duplicados
                var valoracionExistente = await _repository.GetByUsuarioAndLocalAsync(
                    valoracionDto.UsuarioId,
                    valoracionDto.LocalId);

                if (valoracionExistente != null)
                {
                    return Conflict("Ya has valorado este local");
                }

                // Mapear DTO a entidad
                var valoracion = new Valoracion
                {
                    Id = Guid.NewGuid(),
                    Estrellas = valoracionDto.Estrellas,
                    LocalId = valoracionDto.LocalId,
                    UsuarioId = valoracionDto.UsuarioId,
                    Fecha = DateTime.UtcNow
                };

                await _repository.AddAsync(valoracion);

                // Notificación al propietario (opcional)
                try
                {
                    var notificacion = new Notificacion
                    {
                        Titulo = "Nueva valoración recibida",
                        Mensaje = $"Tu local ha recibido {valoracion.Estrellas} estrellas",
                        UsuarioId = valoracion.Local?.PropietarioId ?? Guid.Empty,
                        Fecha = DateTime.UtcNow
                    };

                    if (notificacion.UsuarioId != Guid.Empty)
                    {
                        await _notificacionRepo.AddAsync(notificacion);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al crear notificación: {ex.Message}");
                }

                return CreatedAtAction(nameof(GetById), new { id = valoracion.Id }, new
                {
                    valoracion.Id,
                    valoracion.Estrellas,
                    valoracion.LocalId,
                    valoracion.UsuarioId,
                    valoracion.Fecha
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear la valoración: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ValoracionDTO valoracionDto)
        {
            if (id != valoracionDto.Id) return BadRequest("ID no coincide");

            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return NotFound();

                if (valoracionDto.Estrellas < 1 || valoracionDto.Estrellas > 5)
                {
                    return BadRequest("La valoración debe ser entre 1 y 5 estrellas");
                }

                existing.Estrellas = valoracionDto.Estrellas;
                await _repository.UpdateAsync(existing);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar la valoración: {ex.Message}");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var valoracion = await _repository.GetByIdAsync(id);
                if (valoracion == null)
                {
                    return NotFound(new { mensaje = "La valoración no fue encontrada" });
                }

                await _repository.DeleteAsync(id);
                return Ok(new { mensaje = "Valoración eliminada correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al eliminar la valoración",
                    detalle = ex.Message
                });
            }
        }

    }
}