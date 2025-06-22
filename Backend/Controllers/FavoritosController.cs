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
    public class FavoritosController : ControllerBase
    {
        private readonly IFavoritoRepository _repository;

        public FavoritosController(IFavoritoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var favoritos = await _repository.GetAllAsync();
                return Ok(favoritos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var favorito = await _repository.GetByIdAsync(id);
                if (favorito == null) return NotFound();
                return Ok(favorito);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetByUsuario(Guid usuarioId)
        {
            try
            {
                var favoritos = await _repository.GetByUsuarioIdAsync(usuarioId);
                return Ok(favoritos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet("local/{localId}")]
        public async Task<IActionResult> GetByLocal(Guid localId)
        {
            try
            {
                var favoritos = await _repository.GetByLocalIdAsync(localId);
                return Ok(favoritos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FavoritoCreateDto dto)
        {
            try
            {
                var favorito = new Favorito
                {
                    Id = Guid.NewGuid(),
                    UsuarioId = dto.UsuarioId,
                    LocalId = dto.LocalId
                };

                var nuevo = await _repository.AddAsync(favorito);
                return CreatedAtAction(nameof(GetById), new { id = nuevo.Id }, nuevo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Favorito favorito)
        {
            try
            {
                if (id != favorito.Id) return BadRequest();
                var actualizado = await _repository.UpdateAsync(favorito);
                return Ok(actualizado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
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
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
    }

}
