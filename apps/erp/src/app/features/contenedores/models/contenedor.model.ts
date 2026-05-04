export interface ContenedorAcceso {
  id: number;
  rol: string;
  contenedor: number;
  contenedor_id: number;
  contenedor__nombre: string;
  contenedor__usuarios: string;
  contenedor__imagen: string;
  contenedor__schema_name: string;
  contenedor__reddoc: string;
  contenedor__ruteo: string;
  contenedor__cortesia: boolean;
  contenedor__plan_id: string;
  contenedor__plan__nombre: string;
  contenedor__plan__usuarios_base: string;
  usuario_id: number;
}

export interface ContenedoresResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContenedorAcceso[];
}
