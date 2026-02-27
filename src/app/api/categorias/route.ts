import { NextRequest, NextResponse } from "next/server";

const backendUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** GET /api/categorias — listar todas */
export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${backendUrl()}/categorias`, {
      headers: {
        Cookie: req.headers.get("cookie") ?? "",
        Authorization: req.headers.get("authorization") ?? "",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error en GET /api/categorias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/** POST /api/categorias — crear nueva categoría */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    const res = await fetch(`${backendUrl()}/categorias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
        Authorization: req.headers.get("authorization") ?? "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error en POST /api/categorias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/** PATCH /api/categorias/:id — actualizar */
export async function PATCH(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const id = req.nextUrl.pathname.split("/").pop();

    const res = await fetch(`${backendUrl()}/categorias/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
        Authorization: req.headers.get("authorization") ?? "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error en PATCH /api/categorias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/** DELETE /api/categorias/:id */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();

    const res = await fetch(`${backendUrl()}/categorias/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: req.headers.get("cookie") ?? "",
        Authorization: req.headers.get("authorization") ?? "",
      },
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error en DELETE /api/categorias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
