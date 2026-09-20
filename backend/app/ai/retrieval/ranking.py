from dataclasses import dataclass


@dataclass
class RankedChunk:
    content: str
    score: float
    metadata: dict


def rank_results(results: list[RankedChunk], limit: int = 5) -> list[RankedChunk]:
    return sorted(
        results,
        key=lambda item: item.score,
        reverse=True,
    )[:limit]
