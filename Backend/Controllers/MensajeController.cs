using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
