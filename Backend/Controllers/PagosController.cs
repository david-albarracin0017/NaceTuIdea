using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PagosController : ControllerBase
    {
        private readonly IPagoRepository _repository;

        public PagosController(IPagoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var pagos = await _repository.GetAllAsync();
                return Ok(pagos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener los pagos: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var pago = await _repository.GetByIdAsync(id);
                if (pago == null) return NotFound();
                return Ok(pago);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el pago: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Pago pago)
        {
            try
            {
                await _repository.AddAsync(pago);
                return CreatedAtAction(nameof(GetById), new { id = pago.Id }, pago);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el pago: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Pago pago)
        {
            if (id != pago.Id) return BadRequest("El ID no coincide con el recurso enviado.");

            try
            {
                await _repository.UpdateAsync(pago);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar el pago: {ex.Message}");
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
                return StatusCode(500, $"Error al eliminar el pago: {ex.Message}");
            }
        }
    }


}
