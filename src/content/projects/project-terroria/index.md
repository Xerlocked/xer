---
title: "Terroria - 언리얼 엔진 액션 RPG"
summary: "GAS, 퀘스트·대화 시스템, AI까지. 1인 개발 언리얼 엔진 프로젝트"
date: "Apr 20 2026"
draft: false
tags:
  - UnrealEngine
  - Portfolio
repoUrl: https://github.com/Xerlocked/Terroria
---

# 들어가며

게임 개발자를 지향하고 있지만, 처음부터 혼자서 게임을 만들어 본 경험이 많지 않았습니다. 플러그인 혹은 기술 데모용은 제작 해보았지만, 결국 게임 개발자는 게임을 많이 만들어 봐야 한다는 고민이 있었습니다. 

그 고민에서 출발한 프로젝트가 바로 **Terroria**입니다. 단순히 기능 하나를 구현하는 것을 넘어, 실제 게임에 가까운 구조를 스스로 설계하고 싶었습니다. GAS(Gameplay Ability System) 기반의 스킬 시스템부터 퀘스트·대화 시스템, 행동 트리 기반 AI까지 — 한 프로젝트 안에 여러 시스템을 유기적으로 연결하여 플레이가 가능한 게임을 만드는 것이 목표였습니다.

이 글에서는 Terroria의 핵심 시스템과 구현 과정에서 배운 점들을 정리합니다.

---

# Terroria

:::warning
볼륨을 조절해주세요.
:::

<iframe width="560" height="315" src="https://www.youtube.com/embed/iabD4uI2ZHE?si=FPpZIqZapOmSYxeN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 엔진 | Unreal Engine 5.6 |
| 언어 | C++ / Blueprint |
| 장르 | 탑다운 액션 RPG |
| 기간 | 2025.10 ~ 2026.04 (6개월) |
| 주요 시스템 | GAS, AI, 퀘스트, 대화, 상점 |

---

## 시스템 1 — GAS 기반 스킬 시스템

Terroria의 모든 스킬은 **Gameplay Ability System(GAS)** 위에서 동작합니다. 평타 콤보, 쇼크웨이브, 블랙홀, 대쉬, 보호막 — 각각의 스킬이 `UGameplayAbility`를 상속하고, 피해 계산은 `UGameplayEffectExecutionCalculation`에서 일괄 처리합니다.

### 데미지 계산 구조

```cpp
// ExecutionCalc_Damage.cpp
// 방어구 공식 및 크리티컬 판정을 하나의 ExecCalc에서 처리

if (bool bIsCriticalHit = FMath::RandRange(0.f, 100.f) <= SourceCriticalHitChance)
{
    // 크리티컬: 방어 무시하고 배율 적용
    const float CriticalMultiplier = 1.f + (SourceCriticalHitDamage / 100.f);
    FinalDamage = FinalDamage * CriticalMultiplier;
}
else
{
    // 일반: 방어구 수치에 따른 감쇠
    constexpr float ArmorConstant = 100.f;
    const float DamageMultiplier = ArmorConstant / (EffectiveArmor + ArmorConstant);
    FinalDamage = FinalDamage * DamageMultiplier;
}
```

스킬 데미지 태그는 `SetByCaller`로 런타임에 주입합니다. 이러한 방식을 통해 같은 이펙트 클래스를 재사용하면서 스킬별로 다른 데미지 수치를 적용할 수 있었습니다.

```cpp
// 스킬에서 데미지 값 주입
UAbilitySystemBlueprintLibrary::AssignTagSetByCallerMagnitude(
    SpecHandle, GameplayTags.Damage, DamageBaseValue);
```

### 스킬 시 입력 잠금(Rooted) 처리

스킬 시전 중 이동을 막기 위해 `State.Cast.Rooted` GameplayTag를 활용합니다. 이펙트로 MovementSpeed를 0으로 만들고, 컨트롤러에서 해당 태그를 확인해 입력을 차단합니다.

```cpp
// TPlayerController.cpp
// 스킬 시전 중 이동 입력 무시
if (GetTASC()->HasMatchingGameplayTag(FTGameplayTags::Get().State_Cast_Rooted))
{
    bMovingToDestination = false;
    return;
}
```

별도의 플래그 없이 **태그 하나로 이동·입력 차단을 동시에 제어**하는 방식이 GAS와 GameplayTag의 강점이라는 걸 직접 체감할 수 있었습니다.

---

## 시스템 2 — 퀘스트 & 대화 시스템

퀘스트와 대화는 서로 깊이 연결되어 있는 시스템입니다. NPC와 대화할 때 퀘스트를 수락하고, 목표를 완료하면 다시 NPC에게 보고하는 흐름을 구현했습니다. 각 시스템들은 분리가 되어있어, 추후 플러그인으로 따로 제작하여 프로젝트 이식성을 높일 예정입니다.

### 역할 분리

| 클래스 | 역할 |
|---|---|
| `UQuestManagerSubsystem` | 퀘스트 상태 전체 관리 (GameInstance 범위) |
| `UQuestGiverComponent` | NPC가 제공하는 퀘스트 관리, 마커 상태 갱신 |
| `UQuestReceiverComponent` | 플레이어의 퀘스트 수락·진행·완료 처리 |
| `UDialogueManagerSubsystem` | 대화 세션 관리 (World 범위) |

NPC 머리 위 마커(❗/❓) 역시 퀘스트 상태에 따라 자동으로 갱신됩니다.

```cpp
// QuestGiverComponent.cpp
// 우선순위: 완료 보고 > 수락 가능 > 진행 중
ENPCMarkerState UQuestGiverComponent::GetMarkerState() const
{
    if (GetCompletableQuests().Num() > 0) return ENPCMarkerState::QuestComplete;
    if (GetAvailableQuests().Num() > 0)   return ENPCMarkerState::QuestAvail;
    if (GetActiveQuests().Num() > 0)      return ENPCMarkerState::QuestActive;
    return ENPCMarkerState::None;
}
```

대화 이벤트(`FDialogueEvent`)를 통해 대화 선택지에서 퀘스트 수락, 목표 완료, 아이템 지급 등을 직접 트리거할 수 있습니다.

```cpp
// DialogueManagerSubsystem.cpp
case EDialogueEventType::StartQuest:
    QuestManager->AcceptQuest(Event.QuestID);
    break;

case EDialogueEventType::CompleteObjective:
    QuestManager->UpdateObjective(Event.QuestID, Event.ObjectiveID, 1);
    break;
```

---

## 시스템 3 — 행동 트리 기반 AI

적 AI는 **Behavior Tree + Blackboard + GameplayTag**를 조합해 상태를 관리합니다. 감지, 추적, 공격, 귀환 각 상태를 태그로 표현하고, BT Service가 매 틱마다 Blackboard 값을 갱신합니다. AI 구현이 생각보다 깔끔하지 못해 아쉽습니다만, 추후 다른 프로젝트에서 더 나은 퀄리티를 제작할 수 있지 않을까 생각합니다.

```cpp
// BTService_UpdateCombatContext.cpp
// 매 0.25초마다 타겟까지의 거리 및 범위 내 여부 갱신
const float Distance = FVector::Dist(
    ControlledPawn->GetActorLocation(),
    TargetActor->GetActorLocation());

BB->SetValueAsFloat(DistanceToTargetKey.SelectedKeyName, Distance);
BB->SetValueAsBool(bInAttackRangeKey.SelectedKeyName, Distance <= AttackRange);
```

AI 상태 전환은 `BTTask_SetStateTag`를 통해 이루어집니다. 기존 `State.*` 태그를 모두 제거하고 새 태그를 추가하는 방식으로, 상태 중복 없이 단일 상태를 유지합니다.

Leash 시스템도 구현했습니다. 스폰 위치로부터 일정 거리를 벗어나면 추적을 중단하고 원래 위치로 복귀합니다.

```cpp
// BTService_CheckReturnState.cpp
// Leash 반경 초과 시 귀환 플래그 설정
const bool bLeashExceeded = DistFromHome > LeashRadius;
if (bLeashExceeded && !bCurrentlyNeedReturn)
{
    BB->SetValueAsBool(bNeedReturnKey.SelectedKeyName, true);
}
```

---

## 구현 중 겪은 문제들

### AbilityTask 지연 생성 이슈

블랙홀 스킬 구현 시, 블루프린트에선 잘 작동하던 `WaitTargetData`가 C++에서는 실행되지 않는 문제가 있었습니다. 원인은 TargetActor의 **지연 생성(Deferred Spawn)** 을 생략했기 때문이었습니다.

```cpp
// 잘못된 방식 — TargetActor가 초기화되기 전에 태스크 활성화
Task->ReadyForActivation(); // ❌

// 올바른 방식 — 지연 스폰 완료 후 활성화
AGameplayAbilityTargetActor* GenericActor = nullptr;
if (Task->BeginSpawningActor(this, TargetActorClass, GenericActor))
{
    Task->FinishSpawningActor(this, GenericActor); // TargetActor 초기화
}
Task->ReadyForActivation(); // ✅
```

엔진 코드를 직접 열어 `AbilityTask.h`의 주석을 읽으면서 해결한 경험이었습니다.

해당 관련된 내용은 [AbilityTask와 TargetActor를 활용한 스킬 설계](https://xerlocked.com/blog/ue-skill-black-hole/) 에서 자세히 볼 수 있습니다.

### GameplayCue 트레일 이펙트 즉시 삭제 문제

대쉬 종료 시 나이아가라 트레일 이펙트가 자연스럽게 사라지지 않고 즉시 삭제되는 문제가 있었습니다. `GameplayCueNotify_Actor`의 `OnRemove` 기본 구현이 Actor를 즉시 숨김 처리하기 때문이었습니다.

```cpp
// GameplayCueNotify_Trail.cpp — OnRemove 오버라이드
bool AGameplayCueNotify_Trail::OnRemove_Implementation(
    AActor* MyTarget, const FGameplayCueParameters& Parameters)
{
    // 기본 구현(SetActorHiddenInGame)을 호출하지 않고 false 반환
    // → 나이아가라가 자연스럽게 소멸할 시간을 확보
    return false;
}
```

해당 관련된 내용은 [하데스(Hades) 스타일의 Dash 구현](https://xerlocked.com/blog/ue-skill-dash/) 에서 자세히 볼 수 있습니다.

---

# 마무리

Terroria는 "기능 하나를 만드는 것"에서 벗어나 **여러 시스템이 서로 신호를 주고받는 구조**를 직접 설계해 본 프로젝트입니다.

- GameplayTag 하나로 스킬 잠금과 입력 차단을 동시에 처리하는 경험
- Subsystem과 Component를 역할에 따라 나누는 설계 경험
- 엔진 소스를 읽으면서 문제를 직접 해결하는 경험

프로젝트를 진행하며 "동작하는 코드"보다 "이유 있는 구조"를 고민해야 하는 이유를 알게 되었습니다. 동작에만 집중하면 기능이 추가될수록 리팩토링 비용이 눈덩이처럼 불어난다는 걸, 이 프로젝트에서 직접 경험했습니다.

앞으로도 구현 과정에서 새롭게 배운 내용을 꾸준히 기록해 나가겠습니다. 감사합니다.

상단의 **See Repository** 버튼을 통해 소스코드를 확인하실 수 있습니다.

---

# 프로젝트 관련 글

- [스킬 쿨타임 머티리얼 만들기](https://xerlocked.com/blog/ue-material-cooldown/)
- [인게임 마우스 커서 모양 변경](https://xerlocked.com/blog/ue-cursor/)
- [GAS로 쇼크웨이브 스킬 구현하기](https://xerlocked.com/blog/ue-skill-shockwave/)
- [나이아가라 이펙트를 이용한 데미지 텍스트 출력](https://xerlocked.com/blog/ue-niagara-text/)
- [AbilityTask와 TargetActor를 활용한 스킬 설계](https://xerlocked.com/blog/ue-skill-black-hole/)
- [해상도에 대응하는 비율 유지 위젯 만들기](https://xerlocked.com/blog/ue-widget-scale/)
- [하데스(Hades) 스타일의 Dash 구현](https://xerlocked.com/blog/ue-skill-dash/)
- [Button Hold 기능 구현](https://xerlocked.com/blog/ue-button-hold-event/)
- [GameplayAbility Input Queue System](https://xerlocked.com/blog/ue-input-queue-system/)
- [제자리 회전(Turn In Place)구현하기](https://xerlocked.com/blog/ue-turn-in-place/)