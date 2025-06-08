using Backend.Interface;
using Backend.Modelles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repository;

        public UsersController(IUserRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _repository.GetAllAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener los usuarios: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var user = await _repository.GetByIdAsync(id);
                if (user == null) return NotFound();
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el usuario: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            try
            {
                await _repository.AddAsync(user);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el usuario: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] User user)
        {
            if (id != user.Id) return BadRequest("El ID del usuario no coincide.");

            try
            {
                await _repository.UpdateAsync(user);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar el usuario: {ex.Message}");
            }
        }

        [HttpPut("partial/{id}")]
        public async Task<IActionResult> UpdatePartial(Guid id, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                await _repository.UpdatePartialAsync(id, updates);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar parcialmente el usuario: {ex.Message}");
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
                return StatusCode(500, $"Error al eliminar el usuario: {ex.Message}");
            }
        }
    }


}
