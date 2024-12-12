import { NewRouteForm } from "./NewRouteForm";

type Input = {
  source: string;
  destination: string;
};

type SearchDirectionsOutput = {
  source: { id: string; text: string };
  destination: { id: string; text: string };
  distance: string;
  duration: string;
};

export async function searchDirections(
  input: Input
): Promise<SearchDirectionsOutput> {
  const [sourceResponse, destinationResponse] = await Promise.all([
    fetch(
      `http://localhost:3000/places?text=${input.source}`
      // {
      //   cache: "force-cache",
      //   next: {
      //     revalidate: 1 * 60 * 60 * 24, // 1 dia
      //   },
      // }
    ),
    fetch(
      `http://localhost:3000/places?text=${input.destination}`
      // {
      //   cache: "force-cache",
      //   next: {
      //     revalidate: 1 * 60 * 60 * 24, // 1 dia
      //   },
      // }
    ),
  ]);
  if (!sourceResponse.ok) {
    console.error(await sourceResponse.text());
    throw new Error("Erro ao pesquisar Origem");
  }
  if (!destinationResponse.ok) {
    console.error(await destinationResponse.text());
    throw new Error("Erro ao pesquisar Destino");
  }
  const [sourceData, destinationData] = await Promise.all([
    sourceResponse.json(),
    destinationResponse.json(),
  ]);

  const directionsResponse = await fetch(
    `http://localhost:3000/directions?originId=${sourceData.candidates[0].place_id}&destinationId=${destinationData.candidates[0].place_id}`
    // {
    //   cache: "force-cache",
    //   next: {
    //     revalidate: 1 * 60 * 60 * 24, // 1 dia
    //   },
    // }
  );
  if (!directionsResponse.ok) {
    console.error(await directionsResponse.text());
    throw new Error("Erro ao pesquisar Direções");
  }
  const directionsData = await directionsResponse.json();

  return {
    source: {
      id: sourceData.candidates[0].place_id,
      text: directionsData.routes[0].legs[0].start_address,
    },
    destination: {
      id: destinationData.candidates[0].place_id,
      text: directionsData.routes[0].legs[0].end_address,
    },
    distance: directionsData.routes[0].legs[0].distance.text,
    duration: directionsData.routes[0].legs[0].duration.text,
  };
}

export async function NewRoutePage({
  searchParams,
}: {
  searchParams: Promise<Input>;
}) {
  const { source: sourceParam, destination: destinationParam } =
    await searchParams;

  const directions =
    sourceParam && destinationParam
      ? await searchDirections({
          source: sourceParam,
          destination: destinationParam,
        })
      : undefined;

  let source = undefined,
    destination = undefined,
    distance = undefined,
    duration = undefined;

  if (directions) {
    source = directions.source;
    destination = directions.destination;
    distance = directions.distance;
    duration = directions.duration;
  }

  return (
    <div className="flex flex-1 w-full h-full">
      <div className="w-1/3 p-4 h-full">
        <h4 className="text-3xl text-contrast mb-2">Nova Rota</h4>
        <form className="flex flex-col space-y-4" method="get">
          <div className="relative">
            <input
              id="source"
              name="source"
              type="search"
              placeholder=""
              defaultValue={source?.text}
              className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-contrast bg-default border-0 border-b-2 border-contrast appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
            />
            <label
              htmlFor="source"
              className="absolute text-contrast duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >
              Origem
            </label>
          </div>
          <div className="relative">
            <input
              id="destination"
              name="destination"
              type="search"
              placeholder=""
              defaultValue={destination?.text}
              className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-contrast bg-default border-0 border-b-2 border-contrast appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
            />
            <label
              htmlFor="destination"
              className="absolute text-contrast duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >
              Destino
            </label>
          </div>
          <button
            type="submit"
            className="bg-main text-primary p-2 rounded text-xl font-bold"
          >
            Pesquisar
          </button>
        </form>
        {directions && (
          <div className="mt-4 p-4 border rounded text-contrast">
            <ul>
              <li className="mb-2">
                <strong>Origem:</strong> {source?.text}
              </li>
              <li className="mb-2">
                <strong>Destino:</strong> {destination?.text}
              </li>
              <li className="mb-2">
                <strong>Distância:</strong> {distance}
              </li>
              <li className="mb-2">
                <strong>Duração:</strong> {duration}
              </li>
            </ul>
            <NewRouteForm>
              <input
                type="hidden"
                name="sourceId"
                id="sourceId"
                value={source?.id}
              />
              <input
                type="hidden"
                name="destinationId"
                id="destinationId"
                value={destination?.id}
              />
              <button
                type="submit"
                className="bg-main text-primary font-bold p-2 rounded mt-4"
              >
                Adicionar rota
              </button>
            </NewRouteForm>
          </div>
        )}
      </div>
      <div>MAPA</div>
    </div>
  );
}

export default NewRoutePage;
