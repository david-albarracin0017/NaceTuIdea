using Backend.Interface;
using Backend.Modelles;
using Backend.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LocalController : ControllerBase
    {
        private readonly ILocalRepository _repository;

        public LocalController(ILocalRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var locales = await _repository.GetAllAsync();
                return Ok(locales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener locales: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var local = await _repository.GetByIdAsync(id);
                if (local == null) return NotFound();
                return Ok(local);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener local: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Local local)
        {
            try
            {
                if (local.PropietarioId == Guid.Empty)
                    return BadRequest("Se requiere el ID del propietario.");

                var usuario = await _UserRepository.GetByIdAsync(local.PropietarioId);
                if (usuario == null)
                    return NotFound("Usuario no encontrado.");

                local.Propietario = usuario;

                var nuevo = await _repository.AddAsync(local);
                return CreatedAtAction(nameof(GetById), new { id = nuevo.Id }, nuevo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear local: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Local local)
        {
            if (id != local.Id) return BadRequest();

            try
            {
                await _repository.UpdateAsync(local);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar local: {ex.Message}");
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
                return StatusCode(500, $"Error al eliminar local: {ex.Message}");
            }
        }

        private readonly IUserRepository _UserRepository;

        public LocalController(ILocalRepository repository, IUserRepository userRepository)
        {
            _repository = repository;
            _UserRepository = userRepository;
        }


    }
}
