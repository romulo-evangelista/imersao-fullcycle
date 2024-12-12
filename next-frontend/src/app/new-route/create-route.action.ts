"use server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createRouteAction(state: any, formData: FormData) {
  const { sourceId, destinationId } = Object.fromEntries(formData);

  const directionsResponse = await fetch(
    `http://localhost:3000/directions?originId=${sourceId}&destinationId=${destinationId}`
    // {
    //   cache: "force-cache",
    //   next: {
    //     revalidate: 1 * 60 * 60 * 24, // 1 dia
    //   },
    // }
  );
  if (!directionsResponse.ok) {
    console.error(await directionsResponse.text());
    return { error: "Erro ao pesquisar Direções" };
  }
  const directionsData = await directionsResponse.json();
  const start_address = directionsData.routes[0].legs[0].start_address;
  const end_address = directionsData.routes[0].legs[0].end_address;

  const response = await fetch(`http://localhost:3000/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `${start_address} - ${end_address}`,
      source_id: directionsData.request.origin.place_id.replace(
        "place_id:",
        ""
      ),
      destination_id: directionsData.request.destination.place_id.replace(
        "place_id:",
        ""
      ),
    }),
  });
  if (!response.ok) {
    console.error(await response.text());
    return { error: "Erro ao adicionar Rota" };
  }

  return { success: true };
}
