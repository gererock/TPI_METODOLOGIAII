package com.bodypaint.feature.services.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.request.CuponDescuentoRequestDto;
import com.bodypaint.feature.dto.response.CuponDescuentoResponseDto;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.models.CuponDescuento;
import com.bodypaint.feature.models.TipoDescuento;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.repository.ICuponDescuentoRepository;
import com.bodypaint.feature.services.interfaces.ICuponDescuentoService;

import com.bodypaint.feature.dto.request.CuponUsarRequestDto;

import com.bodypaint.feature.dto.request.CuponAplicarRequestDto;
import com.bodypaint.feature.dto.response.CuponAplicarResponseDto;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CuponDescuentoService implements ICuponDescuentoService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ICuponDescuentoRepository cuponRepository;
    private final IClientreRepository clienteRepository;

    @Override
    public CuponDescuentoResponseDto generarCupon(CuponDescuentoRequestDto dto) {

        Cliente cliente = clienteRepository.findById(dto.idCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        LocalDate fechaDesde = convertirFecha(dto.fechaDesde(), "fecha desde");
        LocalDate fechaHasta = convertirFecha(dto.fechaHasta(), "fecha hasta");

        validarFechas(fechaDesde, fechaHasta);
        validarDescuento(dto.tipoDescuento(), dto.valorDescuento());

        CuponDescuento cupon = CuponDescuento.builder()
                .cliente(cliente)
                .fechaDesde(fechaDesde)
                .fechaHasta(fechaHasta)
                .tipoDescuento(dto.tipoDescuento())
                .valorDescuento(dto.valorDescuento())
                .usado(false)
                .build();

        cupon = cuponRepository.save(cupon);

        Long codigoGenerado = 100000L + cupon.getId();
        cupon.setCodigo(codigoGenerado);

        cupon = cuponRepository.save(cupon);

        return convertirAResponse(cupon);
    }

    private LocalDate convertirFecha(String fecha, String nombreCampo) {
        try {
            return LocalDate.parse(fecha, FORMATO_FECHA);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("La " + nombreCampo + " debe tener formato dd/mm/aaaa.");
        }
    }

    private void validarFechas(LocalDate fechaDesde, LocalDate fechaHasta) {
        LocalDate hoy = LocalDate.now();

        if (fechaDesde.isBefore(hoy)) {
            throw new RuntimeException("La fecha desde no puede estar en el pasado.");
        }

        if (fechaHasta.isBefore(fechaDesde)) {
            throw new RuntimeException("La fecha hasta no puede ser anterior a la fecha desde.");
        }
    }

    private void validarDescuento(TipoDescuento tipoDescuento, BigDecimal valorDescuento) {
        if (tipoDescuento == TipoDescuento.PORCENTAJE) {
            if (valorDescuento.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new RuntimeException("El porcentaje de descuento no puede ser mayor a 100.");
            }
        }
    }

    private CuponDescuentoResponseDto convertirAResponse(CuponDescuento cupon) {
        String mensajeEnvioMail = "Se simuló el envío del cupón al correo "
                + cupon.getCliente().getEmail()
                + " con la validez de la oferta y el descuento correspondiente.";

        return new CuponDescuentoResponseDto(
                cupon.getCodigo(),
                cupon.getCliente().getId(),
                cupon.getCliente().getNombre(),
                cupon.getCliente().getEmail(),
                cupon.getFechaDesde().format(FORMATO_FECHA),
                cupon.getFechaHasta().format(FORMATO_FECHA),
                cupon.getTipoDescuento(),
                cupon.getValorDescuento(),
                cupon.getUsado(),
                mensajeEnvioMail
        );
    }
    @Override
        public CuponAplicarResponseDto aplicarCupon(CuponAplicarRequestDto dto) {

            CuponDescuento cupon = cuponRepository.findByCodigo(dto.codigoCupon())
                    .orElseThrow(() -> new RuntimeException("El código de cupón ingresado no existe."));

            validarCuponParaCliente(cupon, dto.idCliente());
            validarVigenciaCupon(cupon);

            BigDecimal descuentoAplicado = calcularDescuento(cupon, dto.totalPedido());

            if (dto.totalPedido().compareTo(descuentoAplicado) <= 0) {
                throw new RuntimeException("El total del pedido debe ser mayor al descuento aplicado.");
            }

            BigDecimal totalFinal = dto.totalPedido().subtract(descuentoAplicado);

            return new CuponAplicarResponseDto(
                    cupon.getCodigo(),
                    dto.totalPedido(),
                    descuentoAplicado,
                    totalFinal
            );
        }

        private void validarCuponParaCliente(CuponDescuento cupon, Long idCliente) {
            if (!cupon.getCliente().getId().equals(idCliente)) {
                throw new RuntimeException("El cupón no pertenece al cliente indicado.");
            }

            if (Boolean.TRUE.equals(cupon.getUsado())) {
                throw new RuntimeException("El cupón ya fue usado.");
            }
        }

        private void validarVigenciaCupon(CuponDescuento cupon) {
            LocalDate hoy = LocalDate.now();

            if (hoy.isBefore(cupon.getFechaDesde())) {
                throw new RuntimeException("El cupón todavía no está vigente.");
            }

            if (hoy.isAfter(cupon.getFechaHasta())) {
                throw new RuntimeException("El cupón está vencido.");
            }
        }

        private BigDecimal calcularDescuento(CuponDescuento cupon, BigDecimal totalPedido) {
            if (cupon.getTipoDescuento() == TipoDescuento.PORCENTAJE) {
                return totalPedido
                        .multiply(cupon.getValorDescuento())
                        .divide(BigDecimal.valueOf(100));
            }

            return cupon.getValorDescuento();
        }

        @Override
        public CuponDescuentoResponseDto marcarCuponComoUsado(CuponUsarRequestDto dto) {

            CuponDescuento cupon = cuponRepository.findByCodigo(dto.codigoCupon())
                    .orElseThrow(() -> new RuntimeException("El código de cupón ingresado no existe."));

            validarCuponParaCliente(cupon, dto.idCliente());
            validarVigenciaCupon(cupon);

            cupon.setUsado(true);

            cupon = cuponRepository.save(cupon);

            return convertirAResponse(cupon);
        }
}
