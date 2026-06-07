package com.bodypaint.feature.services.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.response.ProductoMasVendidoResponseDto;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.repository.IProductoRepository;
import com.bodypaint.feature.services.interfaces.IReporteProductosMasVendidosService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporteProductosMasVendidosServiceImpl implements IReporteProductosMasVendidosService {

    private final IPedidoRepository pedidoRepository;

    private final IProductoRepository productoRepository;

    @Override
    public List<ProductoMasVendidoResponseDto> generarReporte(Integer mes, Integer anio, Integer dia) {

        validarFiltros(mes, anio, dia);

        List<Pedido> pedidos = pedidoRepository.findAll();

        Map<Long, Integer> cantidadVendidaPorProducto = new HashMap<>();

        for (Pedido pedido : pedidos) {

            if (pedido.getFechaDePedido() == null) {
                continue;
            }

            if (pedido.getEstado() == EstadoPedido.CANCELADO) {
                continue;
            }

            boolean coincideMes = pedido.getFechaDePedido().getMonthValue() == mes;
            boolean coincideAnio = pedido.getFechaDePedido().getYear() == anio;

            if (!coincideMes || !coincideAnio) {
                continue;
            }

            if (pedido.getProductos() == null || pedido.getProductos().isEmpty()) {
                continue;
            }

            pedido.getProductos().forEach((idProducto, cantidad) -> {

                if (idProducto == null || cantidad == null || cantidad <= 0) {
                    return;
                }

                cantidadVendidaPorProducto.merge(idProducto, cantidad, Integer::sum);
            });
        }

        if (cantidadVendidaPorProducto.isEmpty()) {
            throw new RuntimeException("No hay datos de ventas para el mes y año indicados.");
        }

        return cantidadVendidaPorProducto.entrySet()
                .stream()
                .map(entry -> convertirAResponse(entry.getKey(), entry.getValue()))
                .sorted((p1, p2) -> p2.cantidadVendida().compareTo(p1.cantidadVendida()))
                .toList();
    }

    private void validarFiltros(Integer mes, Integer anio, Integer dia) {

        if (dia != null) {
            throw new IllegalArgumentException("No se permite filtrar el reporte por día. Solo se permite filtrar por mes y año.");
        }

        if (mes == null) {
            throw new IllegalArgumentException("El mes es obligatorio.");
        }

        if (mes < 1 || mes > 12) {
            throw new IllegalArgumentException("El mes debe estar entre 1 y 12.");
        }

        if (anio == null) {
            throw new IllegalArgumentException("El año es obligatorio.");
        }

        if (anio <= 0) {
            throw new IllegalArgumentException("El año debe ser positivo.");
        }
    }

    private ProductoMasVendidoResponseDto convertirAResponse(Long idProducto, Integer cantidadVendida) {

        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("No existe un producto con el id: " + idProducto));

        return new ProductoMasVendidoResponseDto(
                producto.getId(),
                producto.getNombre(),
                producto.getMarca(),
                cantidadVendida,
                producto.getPrecio(),
                producto.getStock()
        );
    }

}