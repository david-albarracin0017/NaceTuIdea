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
        private readonly IUserRepository _userRepository;

        public LocalController(ILocalRepository repository, IUserRepository userRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
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

        [HttpGet("usuario/{userId}")]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            try
            {
                var locales = await _repository.GetByUserIdAsync(userId);
                return Ok(locales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener locales del usuario: {ex.Message}");
            }
        }

        [HttpGet("todos")]
        public async Task<IActionResult> GetAllLocalesSinFiltro()
        {
            try
            {
                var locales = await _repository.GetAllAsync();
                return Ok(locales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener todos los locales: {ex.Message}");
            }
        }
        [HttpGet("recientes")]
        public async Task<IActionResult> GetRecientes()
        {
            try
            {
                var locales = await _repository.GetAllAsync();
                var recientes = locales
                    .OrderByDescending(l => l.FechaCreacion)
                    .Take(6); // o la cantidad que quieras
                return Ok(recientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener locales recientes: {ex.Message}");
            }
        }

        [HttpGet("recomendados")]
        public async Task<IActionResult> GetRecomendados()
        {
            try
            {
                var locales = await _repository.GetAllAsync();
                var recomendados = locales
                    .OrderByDescending(l => l.Costo)
                    .Take(6); // Lógica de recomendación simple
                return Ok(recomendados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener locales recomendados: {ex.Message}");
            }
        }

        [HttpGet("multiple")]
        public async Task<IActionResult> GetByMultipleIds([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
                return BadRequest("Debe proporcionar al menos un ID.");

            try
            {
                var idList = ids
                    .Split(',')
                    .Select(idStr => Guid.TryParse(idStr, out var id) ? id : Guid.Empty)
                    .Where(id => id != Guid.Empty)
                    .ToList();

                if (idList.Count == 0)
                    return BadRequest("Ningún ID válido proporcionado.");

                var locales = await _repository.GetByIdsAsync(idList);
                return Ok(locales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener locales por múltiples IDs: {ex.Message}");
            }
        }





        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Local local)
        {
            try
            {
                if (local.PropietarioId == Guid.Empty)
                    return BadRequest("Se requiere el ID del propietario.");

                var usuario = await _userRepository.GetByIdAsync(local.PropietarioId);
                if (usuario == null)
                    return NotFound("Usuario no encontrado.");

                local.Propietario = usuario;

                // ✅ Verificación de duplicado
                var yaExiste = await _repository.ExistsAsync(local.Name, local.Direccion, local.PropietarioId);
                if (yaExiste)
                    return Conflict("Ya existe un local con ese nombre y dirección para este usuario.");

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
            if (id != local.Id)
                return BadRequest("El ID del local no coincide con el ID en la ruta.");

            try
            {
                await _repository.UpdateAsync(local);
                var actualizado = await _repository.GetByIdAsync(id);
                return Ok(actualizado);
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
    }
}