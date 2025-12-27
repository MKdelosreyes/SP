"""
Basic RAG Implementation for Grammar References
Uses OpenAI embeddings and simple vector search
"""

import json
import os
from typing import List, Dict
import numpy as np
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class GrammarRAG:
    def __init__(self):
        self.references = []
        self.embeddings = []
        self.load_references()
    
    def load_references(self):
        """Load grammar references from JSON"""
        references_path = os.path.join(
            os.path.dirname(__file__),
            "references",
            "grammar.json"
        )
        
        with open(references_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Flatten grammar sections into searchable chunks
        for source in data:
            for section in source.get("grammar_sections", []):
                for rule in section.get("rules", []):
                    chunk = {
                        "source": source["source"],
                        "url": source["url"],
                        "section": section["section_name"],
                        "rule_name": rule["name"],
                        "description": rule["description"],
                        "examples": rule.get("examples", []),
                        "common_errors": rule.get("common_errors"),
                        "difficulty": rule.get("difficulty_level", "intermediate"),
                        # Create searchable text
                        "text": f"{rule['name']}: {rule['description']}"
                    }
                    self.references.append(chunk)
        
        print(f"✓ Loaded {len(self.references)} grammar reference chunks")
    
    def embed_references(self):
        """Create embeddings for all references (run once)"""
        if self.embeddings:
            print("Embeddings already exist")
            return
        
        texts = [ref["text"] for ref in self.references]
        
        print(f"Creating embeddings for {len(texts)} chunks...")
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=texts
        )
        
        self.embeddings = [data.embedding for data in response.data]
        print("✓ Embeddings created")
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for relevant grammar rules"""
        if not self.embeddings:
            self.embed_references()
        
        # Get query embedding
        query_response = client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_embedding = query_response.data[0].embedding
        
        # Calculate cosine similarities
        similarities = []
        for i, ref_embedding in enumerate(self.embeddings):
            similarity = self._cosine_similarity(query_embedding, ref_embedding)
            similarities.append((i, similarity))
        
        # Sort by similarity and get top K
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_indices = [i for i, _ in similarities[:top_k]]
        
        # Return top references
        results = []
        for idx in top_indices:
            ref = self.references[idx].copy()
            ref["similarity_score"] = similarities[idx][1]
            results.append(ref)
        
        return results
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def get_context_for_error(self, error_tag: str, sentence: str) -> str:
        """Get relevant context for a grammar error"""
        query = f"Filipino grammar error: {error_tag}. Example: {sentence}"
        results = self.search(query, top_k=2)
        
        context = "Relevant Grammar Rules:\n\n"
        for i, result in enumerate(results, 1):
            context += f"{i}. {result['rule_name']}\n"
            context += f"   {result['description']}\n"
            if result.get('examples'):
                context += f"   Examples: {str(result['examples'][:2])}\n"
            context += "\n"
        
        return context

# Singleton instance
_grammar_rag = None

def get_grammar_rag() -> GrammarRAG:
    """Get or create RAG instance"""
    global _grammar_rag
    if _grammar_rag is None:
        _grammar_rag = GrammarRAG()
        _grammar_rag.embed_references()
    return _grammar_rag

# Example usage
if __name__ == "__main__":
    rag = get_grammar_rag()
    
    # Test search
    query = "Paano gumamit ng pang-angkop na 'na' at 'ng'?"
    results = rag.search(query, top_k=3)
    
    print(f"\nSearch results for: {query}\n")
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['rule_name']} (similarity: {result['similarity_score']:.3f})")
        print(f"   {result['description'][:100]}...")
        print()